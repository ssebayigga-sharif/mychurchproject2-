import { useState, useCallback, useEffect } from "react";
import { AnnouncementCard } from "./AnnouncementCard";
import {
  getAnnouncements,
  addAnnouncement,
  markAnnouncementRead,
  archiveAnnouncement,
} from "../../services/announcementsServices";
import type {
  Announcement,
  AnnouncementCategory,
  AnnouncementPriority,
  MemberDepartment,
  CreateAnnouncementInput,
} from "../../types/church.types";  
import styles from "./AnnouncementTabs.module.scss";

const CATEGORIES: AnnouncementCategory[] = [
  "General",
  "Event",
  "Finance",
  "Youth",
  "Health",
  "Urgent",
];
const PRIORITIES: AnnouncementPriority[] = ["Low", "Normal", "High"];
const DEPARTMENTS: MemberDepartment[] = [
  "Sabbath School",
  "Children",
  "Youth",
  "Music",
  "Deacons",
  "Deaconesses",
  "Health",
  "Communication",
  "Elders",
  "Personal Ministries",
  "Community Services",
];  

type AnnouncementsTabProps = {
  currentUserName: string;
  onNotify: (msg: string, type?: "success" | "error") => void;
};
export const AnnouncementsTab = ({
  currentUserName,
  onNotify,
}: AnnouncementsTabProps) => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    category: "All" as AnnouncementCategory | "All",
    priority: "All" as AnnouncementPriority | "All",
  });

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "",
    body: "",
    category: "General" as AnnouncementCategory,
    priority: "Normal" as AnnouncementPriority,
    targetDepartment: null as MemberDepartment | null,
    expiresAt: "",
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAnnouncements();
      setAnnouncements(data);
    } catch {
      setError("Failed to load announcements.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  const handleMarkRead = async (a: Announcement) => {
    try {
      await markAnnouncementRead(a.id, a.readBy, currentUserName);
      await fetchAnnouncements();
    } catch {
      onNotify("Failed to mark as read.", "error");
    }
  };

  const handleArchive = async (id: string) => {
    try {
      await archiveAnnouncement(id);
      await fetchAnnouncements();
      onNotify("Announcement archived.");
    } catch {
      onNotify("Failed to archive.", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) {
      onNotify("Title and message are required.", "error");
      return;
    }
    try {
      setSubmitting(true);
      const input: CreateAnnouncementInput = {
        title: form.title.trim(),
        body: form.body.trim(),
        category: form.category,
        priority: form.priority,
        targetDepartment: form.targetDepartment,
        authorName: currentUserName,
        createdAt: new Date().toISOString(),
        status: "Active",
        readBy: [],
        expiresAt: form.expiresAt || "", // Keep empty string or actual date
      };
      await addAnnouncement(input);
      
      // Reset form BEFORE closing to avoid flickering
      setForm({
        title: "",
        body: "",
        category: "General",
        priority: "Normal",
        targetDepartment: null,
        expiresAt: "",
      });
      setShowForm(false);
      
      await fetchAnnouncements();
      onNotify("Announcement posted successfully!");
    } catch (err) {
      console.error("Post error:", err);
      onNotify("Failed to post. Please check your connection.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = announcements.filter((a) => {
    if (filters.category !== "All" && a.category !== filters.category)
      return false;
    if (filters.priority !== "All" && a.priority !== filters.priority)
      return false;
    return true;
  });

  const unreadCount = announcements.filter(
    (a) => !a.readBy.includes(currentUserName)
  ).length;

  return (
    <div data-testid="announcements-tab">
      <div className={styles.tabToolbar}>
        <div className={styles.filterRow}>
          <select
            value={filters.category}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                category: e.target.value as any,
              }))
            }
          >
            <option value="All">All categories</option>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <select
            value={filters.priority}
            onChange={(e) =>
              setFilters((f) => ({
                ...f,
                priority: e.target.value as any,
              }))
            }
          >
            <option value="All">All priorities</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
          {unreadCount > 0 && (
            <span className={styles.unreadPill}>{unreadCount} unread</span>
          )}
        </div>
        <button
          className={styles.primaryBtn}
          onClick={() => setShowForm((v) => !v)}
        >
          {showForm ? "Cancel" : "+ New Announcement"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className={styles.inlineForm}>
          <input
            placeholder="Announcement title *"
            value={form.title}
            onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
            disabled={submitting}
            required
          />
          <textarea
            placeholder="Write your announcement..."
            value={form.body}
            onChange={(e) => setForm((p) => ({ ...p, body: e.target.value }))}
            rows={3}
            disabled={submitting}
            required
          />
          <div className={styles.formRow}>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  category: e.target.value as AnnouncementCategory,
                }))
              }
              disabled={submitting}
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={form.priority}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  priority: e.target.value as AnnouncementPriority,
                }))
              }
              disabled={submitting}
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
            <select
              value={form.targetDepartment ?? ""}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  targetDepartment: (e.target.value as MemberDepartment) || null,
                }))
              }
              disabled={submitting}
            >
              <option value="">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
            <input
              type="date"
              value={form.expiresAt}
              min={new Date().toISOString().split("T")[0]}
              onChange={(e) =>
                setForm((p) => ({ ...p, expiresAt: e.target.value }))
              }
              disabled={submitting}
              title="Expires on (optional)"
            />
          </div>
          <button
            type="submit"
            className={styles.primaryBtn}
            disabled={submitting}
          >
            {submitting ? "Posting..." : "Post Announcement"}
          </button>
        </form>
      )}

      {loading && <p className={styles.stateMsg}>Loading announcements...</p>}
      {error && (
        <p className={styles.errorMsg} role="alert">
          {error}
        </p>
      )}

      {!loading && filtered.length === 0 && (
        <div className={styles.emptyState}>
          No announcements match your filters.
        </div>
      )}

      <div className={styles.cardList}>
        {filtered.map((a) => (
          <AnnouncementCard
            key={a.id}
            item={a}
            currentUserName={currentUserName}
            onMarkRead={handleMarkRead}
            onArchive={handleArchive}
          />
        ))}
      </div>
    </div>
  );
};