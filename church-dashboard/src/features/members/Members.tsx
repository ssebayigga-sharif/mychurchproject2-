import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  ContentSwitcher,
  DataTable,
  Loading,
  OverflowMenu,
  OverflowMenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Tag,
  ToastNotification,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";

import type {
  Member,
  CreateMemberInput,
} from "../../types/church.types";
import {
  getMembers,
  addMember,
  deleteMember,
  updateMember,
} from "../../services/memberServices";
import { MemberModal } from "./MemberModal";
import styles from "./members.module.scss";

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
  return (words[0][0] + (words[1]?.[0] || "")).toUpperCase();
};

export const Members = () => {
  const navigate = useNavigate();
  const [members, setMembers] = useState<Member[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingMember, setEditingMember] = useState<Member | undefined>();
  const [activeTab, setActiveTab] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success"
  ) => {
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
    const confirmed = window.confirm(
      `Remove ${member.firstName} ${member.lastName} from the church records?`
    );
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

  const filteredMembers = members.filter((m) => {
    const isVisitor = m.memberType === "Visitor";
    if (activeTab === 1 && isVisitor) return false; // Members only
    if (activeTab === 2 && !isVisitor) return false; // Visitors only
    return true;
  });

  const headerData = [
    { header: "Member", key: "name" },
    { header: "Department", key: "department" },
    { header: "Baptism", key: "baptismStatus" },
    { header: "Contact", key: "contact" },
    { header: "Role", key: "memberType" },
    { header: "", key: "actions" },
  ];

  const rows = filteredMembers.map((m) => ({
    id: m.id,
    name: `${m.firstName} ${m.lastName}`,
    firstName: m.firstName,
    lastName: m.lastName,
    memberType: m.memberType,
    department: m.department,
    baptismStatus: m.baptismStatus,
    phone: m.phone,
    email: m.email,
  }));

  if (isLoading) {
    return <Loading withOverlay title="Loading Members..." />;
  }

  return (
    <div className={styles.page}>
      {toast && (
        <ToastNotification
          kind={toast.type}
          title={toast.type === "success" ? "Success" : "Error"}
          subtitle={toast.message}
          timeout={3000}
          onClose={() => setToast(null)}
          className={styles.notification}
        />
      )}

      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Church Members</h1>
          <p className={styles.subheading}>Manage the registry of all active church members</p>
        </div>
        <Button onClick={handleAdd} kind="primary" renderIcon={Add}>
          Add Member
        </Button>
      </div>

      <div className={styles.controls}>
        <ContentSwitcher
          onChange={(e) => setActiveTab(e.index ?? 0)}
          selectedIndex={activeTab}
          className={styles.switcher}
        >
          <Switch text={`All (${members.length})`} />
          <Switch text="Official Members" />
          <Switch text="Recent Visitors" />
        </ContentSwitcher>
      </div>

      <DataTable rows={rows} headers={headerData}>
        {({
          rows,
          headers,
          getHeaderProps,
          getRowProps,
          getTableProps,
          getToolbarProps,
          onInputChange,
        }) => (
          <TableContainer className={styles.tableContainer}>
            <TableToolbar {...getToolbarProps()}>
              <TableToolbarContent>
                <TableToolbarSearch
                  placeholder="Search by name or department..."
                  onChange={onInputChange}
                />
              </TableToolbarContent>
            </TableToolbar>
            <Table {...getTableProps()}>
              <TableHead>
                <TableRow>
                  {headers.map((header) => (
                    <TableHeader {...getHeaderProps({ header })}>
                      {header.header}
                    </TableHeader>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => {
                  const member = filteredMembers.find((m) => m.id === row.id)!;
                  const fullName = `${member.firstName} ${member.lastName}`;
                  return (
                    <TableRow {...getRowProps({ row })}>
                      <TableCell>
                        <div className={styles.memberCell}>
                          <div className={`${styles.avatarMini} ${getAvatarColor(fullName)}`}>
                            {getInitials(fullName)}
                          </div>
                          <span className={styles.nameText}>{fullName}</span>
                        </div>
                      </TableCell>
                      <TableCell>{member.department}</TableCell>
                      <TableCell>
                        <Tag
                          type={
                            member.baptismStatus === "Baptized"
                              ? "green"
                              : member.baptismStatus === "In preparation"
                              ? "warm-gray"
                              : "outline"
                          }
                          size="sm"
                        >
                          {member.baptismStatus}
                        </Tag>
                      </TableCell>
                      <TableCell>
                        <div className={styles.contactCell}>
                          <span className={styles.contactValue}>{member.phone || "—"}</span>
                          <span className={styles.contactSub}>{member.email || ""}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Tag type={member.memberType === "Visitor" ? "purple" : "cool-gray"} size="sm">
                          {member.memberType}
                        </Tag>
                      </TableCell>
                      <TableCell>
                        <OverflowMenu flipped size="sm">
                          <OverflowMenuItem
                            itemText="View Profile"
                            onClick={() => navigate(`/members/${member.id}/profile`)}
                          />
                          <OverflowMenuItem
                            itemText="Edit Details"
                            onClick={() => handleEdit(member)}
                          />
                          <OverflowMenuItem
                            itemText="Delete Member"
                            hasDivider
                            isDelete
                            onClick={() => handleDelete(member)}
                            disabled={deletingId === member.id}
                          />
                        </OverflowMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DataTable>

      <MemberModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        member={editingMember}
      />
    </div>
  );
};
