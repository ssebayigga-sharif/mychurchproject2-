"use client";

import {
  Button,
  Column,
  Grid,
  Stack,
  ToastNotification,
  Search,
  SkeletonText,
  ContentSwitcher,
  Switch,
  Tile,
} from "@carbon/react";
import { Add } from "@carbon/icons-react";

import { useCallback, useEffect, useState } from "react";
import type {
  PrayerRequest,
  CreatePrayerRequestInput,
} from "../../../lib/types/church.types";
import styles from "../../../styles/modules/PrayerRequests.module.scss";
import {
  addPrayerRequest,
  completePrayerRequest,
  deletePrayerRequest,
  getPrayerRequest,
} from "../../../lib/services/prayerServices";
import { PrayerModal } from "../../../components/prayers/PrayerModal";
import { PrayerCard } from "../../../components/prayers/PrayerCard";

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

export default function PrayerPage() {
  const [prayers, setPrayers] = useState<PrayerRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [notification, setNotification] = useState<{
    message: string;
    kind: "success" | "error";
  } | null>(null);
  const activeTab = activeTabIndex === 0 ? "Pending" : "Completed";

  const showNotification = (
    message: string,
    kind: "success" | "error" = "success",
  ) => {
    setNotification({ message, kind });
    setTimeout(() => setNotification(null), 3500);
  };

  const fetchPrayers = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPrayerRequest();
      setPrayers(data);
    } catch {
      showNotification("Failed to load prayer requests", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrayers();
  }, [fetchPrayers]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsPanelOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const addHandler = async (input: CreatePrayerRequestInput) => {
    try {
      await addPrayerRequest(input);
      setIsPanelOpen(false);
      showNotification("Prayer request submitted successfully!", "success");
      fetchPrayers();
    } catch {
      showNotification(
        "Failed to submit prayer request. Please try again.",
        "error",
      );
    }
  };

  const completePrayerHandler = async (prayer: PrayerRequest) => {
    const confirmed = window.confirm(
      `Mark "${prayer.name}'s" request as answered?`,
    );
    if (!confirmed) return;
    try {
      await completePrayerRequest(prayer.id);
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === prayer.id
            ? {
                ...p,
                status: "Completed",
                completedAt: new Date().toISOString(),
              }
            : p,
        ),
      );
      showNotification("Praise God! Prayer marked as answered.");
    } catch {
      showNotification("Failed to update prayer request", "error");
    }
  };

  const prayerHandler = async (prayer: PrayerRequest) => {
    try {
      setPrayers((prev) =>
        prev.map((p) =>
          p.id === prayer.id ? { ...p, prayerCount: p.prayerCount + 1 } : p,
        ),
      );
      showNotification("You've joined in praying for this request.");
    } catch {
      showNotification("Failed to update prayer count.", "error");
    }
  };

  const deleteHandler = async (prayer: PrayerRequest) => {
    const confirmed = window.confirm(
      `Delete this prayer request from ${prayer.name}?`,
    );
    if (!confirmed) return;
    try {
      await deletePrayerRequest(prayer.id);
      setPrayers((prev) => prev.filter((p) => p.id !== prayer.id));
      showNotification("Prayer request removed.");
    } catch {
      showNotification("Failed to delete prayer request.", "error");
    }
  };

  const filtered = prayers.filter((p) => {
    const matchesTab = p.status === activeTab;
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      query === "" ||
      (p.name || "").toLowerCase().includes(query) ||
      (p.request || "").toLowerCase().includes(query);

    return matchesTab && matchesSearch;
  });

  const pendingCount = prayers.filter((p) => p.status === "Pending").length;

  return (
    <div
      className={`${styles.page} ${isPanelOpen ? styles.pageWithDrawerOpen : ""}`}
    >
      {notification && (
        <div className={styles.notificationBar}>
          <ToastNotification
            kind={notification.kind}
            title={notification.kind === "success" ? "Success" : "Error"}
            subtitle={notification.message}
            onClose={() => setNotification(null)}
            lowContrast
          />
        </div>
      )}

      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <div className={styles.pageHeader}>
            <div>
              <h2 className={styles.heading}>Prayer Request</h2>
              <p className={styles.subheading}>Lifting One Another In Prayer</p>
            </div>
            <Button
              kind="primary"
              renderIcon={Add}
              onClick={() => setIsPanelOpen(true)}
              className={styles.selector}
            >
              Add A Prayer Request
            </Button>
          </div>

          <div className={styles.switcherWrapper}>
            <ContentSwitcher
              selectedIndex={activeTabIndex}
              onChange={({ index }) => setActiveTabIndex(index as number)}
              size="lg"
            >
              <Switch
                name="Pending"
                text={`Pending ${pendingCount > 0 ? `(${pendingCount})` : ""}`}
              />
              <Switch name="Answered" text="Answered" />
            </ContentSwitcher>
          </div>

          <Grid
            className={styles.controlsGrid}
            narrow
            style={{
              paddingLeft: 0,
              paddingRight: 0,
              marginBottom: "2rem",
              marginTop: "1rem",
            }}
          >
            <Column sm={4} md={8} lg={16}>
              <Search
                size="lg"
                labelText="Search prayer requests"
                placeholder="Search by name or keyword..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery("")}
              />
            </Column>
          </Grid>

          <div className={styles.listContainer}>
            {activeTabIndex === 0 && (
              <>
                {isLoading ? (
                  <Stack gap={5}>
                    {[1, 2, 3].map((i) => (
                      <Tile
                        key={i}
                        style={{
                          padding: "2rem",
                          background: "var(--cds-layer-01)",
                        }}
                      >
                        <SkeletonText heading width="30%" />
                        <div style={{ marginTop: "1rem" }}>
                          <SkeletonText paragraph lineCount={3} />
                        </div>
                      </Tile>
                    ))}
                  </Stack>
                ) : filtered.length === 0 ? (
                  searchQuery.trim() !== "" ? (
                    <div className={styles.emptyState}>
                      <p className={styles.emptyTitle}>
                        No requests match your search
                      </p>
                      <Button
                        kind="tertiary"
                        onClick={() => {
                          setSearchQuery("");
                        }}
                      >
                        Clear Filters
                      </Button>
                    </div>
                  ) : (
                    <EmptyState tab="Pending" />
                  )
                ) : (
                  <Stack gap={5}>
                    {filtered.map((p) => (
                      <PrayerCard
                        key={p.id}
                        prayer={p}
                        onPrayForIt={prayerHandler}
                        onMarkAnswered={completePrayerHandler}
                        onDelete={deleteHandler}
                      />
                    ))}
                  </Stack>
                )}
              </>
            )}

            {activeTabIndex === 1 && (
              <>
                {isLoading ? (
                  <Stack gap={5}>
                    {[1, 2].map((i) => (
                      <Tile
                        key={i}
                        style={{
                          padding: "2rem",
                          background: "var(--cds-layer-01)",
                        }}
                      >
                        <SkeletonText heading width="30%" />
                        <div style={{ marginTop: "1rem" }}>
                          <SkeletonText paragraph lineCount={2} />
                        </div>
                      </Tile>
                    ))}
                  </Stack>
                ) : filtered.length === 0 ? (
                  <EmptyState tab="Completed" />
                ) : (
                  <Stack gap={5}>
                    {filtered.map((p) => (
                      <PrayerCard
                        key={p.id}
                        prayer={p}
                        onPrayForIt={prayerHandler}
                        onMarkAnswered={completePrayerHandler}
                        onDelete={deleteHandler}
                      />
                    ))}
                  </Stack>
                )}
              </>
            )}
          </div>
        </Column>
      </Grid>

      {/* Prayer Request slide-in panel (self-contained) */}
      <PrayerModal
        visible={isPanelOpen}
        onClose={() => setIsPanelOpen(false)}
        onSave={addHandler}
      />
    </div>
  );
}
