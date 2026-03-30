import { useCallback, useEffect, useState } from "react";
import styles from "./members.module.scss";
import type { Member, BaptismStatus, CreateMemberInput } from "../../types/church.types";
import { getMembers, addMember, deleteMember, updateMember } from "../../services/memberServices";
import { MemberModal } from "./MemberModal";
import { useNavigate } from "react-router-dom";

// Badge style per baptism status
const BAPTISM_STYLE: Record<BaptismStatus, string> = {
  Baptized: styles.badgeGreen,
  "Not baptized": styles.badgeGray,
  "In preparation": styles.badgeAmber,
};

const getAvatarColor = (name: string) => {
  const colors = [
    styles.avatarBlue,
    styles.avatarGreen,
    styles.avatarPurple,
    styles.avatarOrange,
    styles.avatarPink,
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
};

export const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"All" | "Members" | "Visitors">("All");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getMembers();
      setMembers(data);
    } catch {
      showToast("Failed to load members. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  const handleAdd = () => {
    setEditingMember(undefined);
    setModalVisible(true);
  };

  const handleEdit = (member: Member) => {
    setEditingMember(member);
    setModalVisible(true);
  };

  const handleDelete = async (member: Member) => {
    const confirmed = window.confirm(`Remove ${member.firstName} ${member.lastName} from the church records?`);
    if (!confirmed) return;

    try {
      setDeletingId(member.id);
      await deleteMember(member.id);
      setMembers((prev) => prev.filter((m) => m.id !== member.id));
      showToast(`Removed ${member.firstName} from records.`);
    } catch {
      showToast("Failed to delete member. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const handleSave = async (data: CreateMemberInput, id?: string) => {
    try {
      if (id) {
        await updateMember(id, data);
      } else {
        await addMember(data);
      }
      setModalVisible(false);
      await fetchMembers();
      showToast(`Member successfully ${id ? "updated" : "added"}!`);
    } catch {
      showToast("Failed to save member. Please try again.", "error");
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredMembers = members.filter((m) => {
    // 1. Filter by Tab
    const isVisitor = m.memberType === "Visitor";
    if (activeTab === "Members" && isVisitor) return false;
    if (activeTab === "Visitors" && !isVisitor) return false;

    // 2. Filter by Search Query
    if (query === "") return true;
    const fName = (m.firstName || "").toLowerCase();
    const lName = (m.lastName || "").toLowerCase();
    const dept = (m.department || "").toLowerCase();
    return fName.includes(query) || lName.includes(query) || dept.includes(query);
  });

  return (
    <div className={styles.page}>
      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type}`]}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      {/* Header & Controls */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Church Members</h1>
          <p className={styles.subheading}>Manage the registry of all active church members</p>
        </div>
        <button onClick={handleAdd} className={styles.btnAdd}>+ Add Member</button>
      </div>

      <div className={styles.controls}>
        <div className={styles.tabs}>
          <button 
            className={`${styles.tabBtn} ${activeTab === "All" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("All")}
          >
            All People ({members.length})
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "Members" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("Members")}
          >
            Official Members
          </button>
          <button 
            className={`${styles.tabBtn} ${activeTab === "Visitors" ? styles.activeTab : ""}`}
            onClick={() => setActiveTab("Visitors")}
          >
            Visitors
          </button>
        </div>

        <div className={styles.searchWrap}>
          <span className={styles.searchIcon}>🔍</span>
          <input
            className={styles.searchInput}
            placeholder="Search by name or department..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Main List */}
      {isLoading ? (
        <p className={styles.emptyText}>Loading members...</p>
      ) : filteredMembers.length === 0 ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#b7dcca" strokeWidth="1.5">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
            <circle cx="9" cy="7" r="4"></circle>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
          </svg>
          <p className={styles.emptyTitle}>No members found</p>
          {query !== "" && (
            <button className={styles.btnClear} onClick={() => setSearchQuery("")}>
              Clear Search
            </button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredMembers.map((m) => {
            const fullName = `${m.firstName} ${m.lastName}`;
            return (
              <div key={m.id} className={styles.memberCard}>
                <div className={styles.cardHeader}>
                  <div className={`${styles.avatar} ${getAvatarColor(fullName)}`}>
                    {getInitials(fullName)}
                  </div>
                  <div className={styles.headerInfo}>
                    <div className={styles.nameRow}>
                      <span className={styles.memberName}>{fullName}</span>
                      {m.memberType === "Visitor" && (
                        <span className={`${styles.badge} ${styles.badgeVisitor}`}>Visitor</span>
                      )}
                    </div>
                    <span className={`${styles.badge} ${styles.badgeDept}`}>{m.department}</span>
                  </div>
                </div>

                <div className={styles.cardBody}>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Phone</span>
                    <span className={styles.infoValue}>{m.phone || "—"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Email</span>
                    <span className={styles.infoValue}>{m.email || "—"}</span>
                  </div>
                  <div className={styles.infoRow}>
                    <span className={styles.infoLabel}>Baptism Status</span>
                    <span className={`${styles.badge} ${BAPTISM_STYLE[m.baptismStatus]}`}>
                      {m.baptismStatus}
                    </span>
                  </div>
                </div>

                <div className={styles.cardFooter}>
                  <button className={styles.btnAction} onClick={() => navigate(`/members/${m.id}/profile`)}>
                    Profile
                  </button>
                  <button className={styles.btnAction} onClick={() => handleEdit(m)}>
                    Edit
                  </button>
                  <button
                    className={`${styles.btnAction} ${styles.btnDanger}`}
                    onClick={() => handleDelete(m)}
                    disabled={deletingId === m.id}
                  >
                    {deletingId === m.id ? "..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <MemberModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        member={editingMember}
      />
    </div>
  );
};
