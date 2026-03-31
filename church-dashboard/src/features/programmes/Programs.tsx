import { useCallback, useEffect, useState } from "react";
import styles from "./Programs.module.scss";
import { Button, Search } from "@carbon/react";
import { Add } from "@carbon/icons-react";

import type { CreateProgramInput, Program } from "../../types/church.types";
import {
  addProgram,
  deleteProgram,
  getPrograms,
  updateProgram,
} from "../../services/programServices";
import { ProgramModal } from "./ProgramModal";

export const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>();
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchPrograms = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await getPrograms();
      setPrograms(data);
    } catch {
      showToast("Failed to load programs. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPrograms();
  }, [fetchPrograms]);

  const addProgramHandler = () => {
    setEditingProgram(undefined);
    setModalOpen(true);
  };

  const editProgramHandler = (program: Program) => {
    setEditingProgram(program);
    setModalOpen(true);
  };

  const deleteProgramHandler = async (program: Program) => {
    const confirmed = window.confirm(
      `Delete "${program.title}"? This cannot be undone.`,
    );
    if (!confirmed) return;
    try {
      setDeletingId(program.id);
      await deleteProgram(program.id);
      setPrograms((prev) => prev.filter((p) => p.id !== program.id));
      showToast(`Deleted program: ${program.title}`);
    } catch {
      showToast("Failed to delete program. Please try again.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const saveProgramHandler = async (data: CreateProgramInput, id?: string) => {
    try {
      if (id) {
        await updateProgram(id, data);
      } else {
        await addProgram(data);
      }
      setModalOpen(false);
      await fetchPrograms();
      showToast(`Program successfully ${id ? "updated" : "added"}!`);
    } catch {
      showToast("Failed to save program. Please try again.", "error");
    }
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredPrograms = programs.filter((p) => {
    if (query === "") return true;
    const title = (p.title || "").toLowerCase();
    const speaker = (p.speaker || "").toLowerCase();
    const theme = (p.theme || "").toLowerCase();
    return (
      title.includes(query) || speaker.includes(query) || theme.includes(query)
    );
  });

  // Helper to parse date for the calendar block
  const parseDate = (dateStr: string) => {
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return { month: "—", day: "—" };
      return {
        month: d.toLocaleDateString("en-US", { month: "short" }).toUpperCase(),
        day: d.getDate(),
      };
    } catch {
      return { month: "—", day: "—" };
    }
  };

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
          <h1 className={styles.heading}>Sabbath Programs</h1>
          <p className={styles.subheading}>
            Manage upcoming schedules, events, and church activities
          </p>
        </div>
        <Button
          onClick={addProgramHandler}
          kind="primary"
          renderIcon={Add}
          // className={styles.btnAdd}
        >
          Add Program
        </Button>
      </div>

      <div className={styles.controls}>
        {/* <span className={styles.searchIcon}>🔍</span> */}
        <Search
          labelText="Search"
          // className={styles.searchInput}
          // placeholder="Search by title, speaker, or theme..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Main Feed */}
      {isLoading ? (
        <p className={styles.emptyText}>Loading programs...</p>
      ) : filteredPrograms.length === 0 ? (
        <div className={styles.emptyState}>
          {/* <svg
            width="64"
            height="64"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#b7dcca"
            strokeWidth="1.5"
          >
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
            <line x1="16" y1="2" x2="16" y2="6"></line>
            <line x1="8" y1="2" x2="8" y2="6"></line>
            <line x1="3" y1="10" x2="21" y2="10"></line>
          </svg> */}
          <p className={styles.emptyTitle}>No programs found</p>
          {query !== "" && (
            <Button
              // className={styles.btnClear}
              kind="tertiary"
              onClick={() => setSearchQuery("")}
            >
              Clear Search
            </Button>
          )}
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredPrograms.map((p) => {
            const { month, day } = parseDate(p.date);
            return (
              <div key={p.id} className={styles.programCard}>
                {/* Calendar Date Block */}
                <div className={styles.dateBlock}>
                  <span className={styles.dateMonth}>{month}</span>
                  <span className={styles.dateDay}>{day}</span>
                </div>

                {/* Card Content */}
                <div className={styles.cardContent}>
                  <div className={styles.cardHeader}>
                    <span className={styles.title}>{p.title}</span>
                    <span
                      className={`${styles.badge} ${p.status === "Upcoming" ? styles.upcoming : styles.completed}`}
                    >
                      {p.status}
                    </span>
                  </div>

                  <div className={styles.cardDetails}>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Theme:</span>
                      <span className={styles.detailValue}>
                        {p.theme || "—"}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Speaker:</span>
                      <span className={styles.detailValue}>
                        {p.speaker || "—"}
                      </span>
                    </div>
                    <div className={styles.detailRow}>
                      <span className={styles.detailLabel}>Type:</span>
                      <span className={styles.detailValue}>
                        {p.type || "General"}
                      </span>
                    </div>
                  </div>

                  <div className={styles.cardActions}>
                    <Button
                      onClick={() => editProgramHandler(p)}
                      kind="tertiary"
                      // className={styles.btnAction}
                    >
                      Edit
                    </Button>
                    <Button
                      onClick={() => deleteProgramHandler(p)}
                      // className={`${styles.btnAction} ${styles.btnDanger}`}
                      kind="secondary"
                      disabled={deletingId === p.id}
                    >
                      {deletingId === p.id ? "..." : "Delete"}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Modal */}
      <ProgramModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveProgramHandler}
        program={editingProgram}
      />
    </div>
  );
};
