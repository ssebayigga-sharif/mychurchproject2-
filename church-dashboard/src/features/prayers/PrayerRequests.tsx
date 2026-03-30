import { useCallback, useEffect, useState } from "react";
import type {
  PrayerRequest,
  CreatePrayerRequestInput,
} from "../../types/church.types";
import styles from "./PrayerRequests.module.scss";
import {
  addPrayerRequest,
  completePrayerRequest,
  deletePrayerRequest,
  getPrayerRequest,
} from "../../services/prayerServices";
import { PrayerModal } from "./PrayerModal";
import { PrayerCard } from "./PrayerCard";

const CATEGORIES = [
  "All",
  "Health",
  "Family",
  "Financial",
  "Spiritual Growth",
  "Bereavement",
  "Thanks Giving",
  "Other",
];

const EmptyState = ({ tab }: { tab: "Pending" | "Completed" }) => (
  <div className={styles.emptyState}>
    <svg
      width="64"
      height="64"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={styles.emptyIcon}
    >
      {tab === "Pending" ? (
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
      ) : (
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3" />
      )}
    </svg>
    <p className={styles.emptyTitle}>
      {tab === "Pending" ? "No pending requests" : "No answered prayers yet"}
    </p>
    <p className={styles.emptyText}>
      {tab === "Pending"
        ? "When members submit prayer requests, they will appear here for the congregation."
        : "Answered prayers will be moved here so we can celebrate God's faithfulness together."}
    </p>
  </div>
);

export const PrayerRequests = () => {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"Pending" | "Completed">("Pending");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPrayers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPrayerRequest();
      setPrayers(data);
    } catch {
      showToast("Failed to load prayer requests", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  const addHandler = async (input: CreatePrayerRequestInput) => {
    try {
      await addPrayerRequest(input);
      setIsModalOpen(false);
      showToast("Prayer request submitted successfully!");
      fetchPrayers();
    } catch {
      showToast("Failed to submit prayer request. Please try again.", "error");
    }
  };

  const completePrayerHandler = async (prayer: PrayerRequest) => {
    const confirmed = window.confirm(`Mark "${prayer.name}'s" request as answered?`);
    if (!confirmed) return;
    try {
      await completePrayerRequest(prayer.id);
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === prayer.id
            ? { ...p, status: "Completed", completedAt: new Date().toISOString() }
            : p
        )
      );
      showToast("Praise God! Prayer marked as answered.");
    } catch {
      showToast("Failed to update prayer request", "error");
    }
  };

  const prayerHandler = async (prayer: PrayerRequest) => {
    try {
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === prayer.id ? { ...p, prayerCount: p.prayerCount + 1 } : p
        )
      );
      showToast("You've joined in praying for this request.");
    } catch {
      showToast("Failed to update prayer count.", "error");
    }
  };

  const deleteHandler = async (prayer: PrayerRequest) => {
    const confirmed = window.confirm(`Delete this prayer request from ${prayer.name}?`);
    if (!confirmed) return;
    try {
      await deletePrayerRequest(prayer.id);
      setPrayers((prev) => prev.filter((p) => p.id !== prayer.id));
      showToast("Prayer request removed.");
    } catch {
      showToast("Failed to delete prayer request.", "error");
    }
  };

  const filtered = prayers.filter((p) => {
    const matchesTab = p.status === activeTab;
    const query = searchQuery.trim().toLowerCase();
    const safeName = (p.name || "").toLowerCase();
    const safeRequest = (p.request || "").toLowerCase();
    const matchesSearch = query === "" || safeName.includes(query) || safeRequest.includes(query);
    const matchesCategory = filterCategory === "All" || p.category === filterCategory;
    return matchesTab && matchesSearch && matchesCategory;
  });

  const pendingCount = prayers.filter((p) => p.status === "Pending").length;

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${toast.type === "success" ? styles.toastSuccess : styles.toastError}`}>
          {toast.message}
        </div>
      )}

      <div className={styles.pageHeader}>
        <div>
          <h2 className={styles.heading}>Prayer Requests</h2>
          <p className={styles.subheading}>Lifting one another up in prayer</p>
        </div>
        <button className={styles.btnAdd} onClick={() => setIsModalOpen(true)}>
          + Add Prayer Request
        </button>
      </div>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "Pending" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("Pending")}
        >
          Pending
          {pendingCount > 0 && <span className={styles.tabBadge}>{pendingCount}</span>}
        </button>
        <button
          className={`${styles.tab} ${activeTab === "Completed" ? styles.tabActive : ""}`}
          onClick={() => setActiveTab("Completed")}
        >
          Answered
        </button>
      </div>

      {/* Search & Filters */}
      <div className={styles.controls}>
        <input
          type="text"
          placeholder="Search requests by name or keyword..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className={styles.filterSelect}
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* List */}
      {isLoading ? (
        <p className={styles.empty}>Loading prayer requests...</p>
      ) : filtered.length === 0 ? (
        (searchQuery.trim() !== "" || filterCategory !== "All") ? (
          <div className={styles.emptyState}>
            <p className={styles.emptyTitle}>No requests match your current filters</p>
            <button 
               className={styles.btnClear} 
               onClick={() => { setSearchQuery(""); setFilterCategory("All"); }}
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <EmptyState tab={activeTab} />
        )
      ) : (
        <div className={styles.list}>
          {filtered.map((p) => (
            <PrayerCard
              key={p.id}
              prayer={p}
              onPrayForIt={prayerHandler}
              onMarkAnswered={completePrayerHandler}
              onDelete={deleteHandler}
            />
          ))}
        </div>
      )}

      <PrayerModal
        visible={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={addHandler}
      />
    </div>
  );
};
