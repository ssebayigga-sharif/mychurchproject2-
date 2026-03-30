import { useState, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import styles from "./communication.module.scss";
import { AnnouncementsTab } from "./AnnouncementTabs";  
import { MessagesTab } from "./Messages";
import { BroadcastTab } from "./Broadcast";


type Tab = "announcements" | "broadcast" | "messages";


export const Communication = () => {
  const { user } = useAuth();
  const currentUserName = user?.name ?? "Admin";

  const [activeTab, setActiveTab] = useState<Tab>("announcements");
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error" = "success") => {
      setToast({ message, type });
      setTimeout(() => setToast(null), 3500);
    },
    []
  );

  return (
    <div className={styles.page}>
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type}`]}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      <header className={styles.pageHeader}>
        <h1>Communication</h1>
      </header>

      <nav
        className={styles.tabNav}
        role="tablist"
        aria-label="Communication sections"
      >
        <button
          role="tab"
          aria-selected={activeTab === "announcements"}
          className={`${styles.tabBtn} ${
            activeTab === "announcements" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("announcements")}
        >
          Announcements
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "broadcast"}
          className={`${styles.tabBtn} ${
            activeTab === "broadcast" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("broadcast")}
        >
          Broadcast
        </button>
        <button
          role="tab"
          aria-selected={activeTab === "messages"}
          className={`${styles.tabBtn} ${
            activeTab === "messages" ? styles.tabActive : ""
          }`}
          onClick={() => setActiveTab("messages")}
        >
          Messages
        </button>
      </nav>

      <main className={styles.tabContent}>
        {activeTab === "announcements" && (
          <AnnouncementsTab
            currentUserName={currentUserName}
            onNotify={showToast}
          />
        )}
        {activeTab === "broadcast" && (
          <BroadcastTab currentUserName={currentUserName} onNotify={showToast} />
        )}
        {activeTab === "messages" && (
          <MessagesTab currentUserName={currentUserName} onNotify={showToast} />
        )}
      </main>
    </div>
  );
};