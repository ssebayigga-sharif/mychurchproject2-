import { useCallback, useEffect, useState } from "react";
import { getMembers } from "../../services/memberServices";
import { getPrograms } from "../../services/programServices";
import styles from "./Attendance.module.scss";
import { getAttendance, markAttendance } from "../../services/attendanceServieces";
import type { Member, AttendanceMap, Program } from "../../types/church.types";

const getInitials = (name: string) => {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
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
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export const Attendance = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [m, p] = await Promise.all([getMembers(), getPrograms()]);
      setMembers(m);
      setPrograms(p);
    } catch {
      showToast("Failed to load attendance data.", "error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const changeProgramHandler = async (programId: string) => {
    if (!programId) return;
    try {
      setSelectedProgram(programId);
      const data = await getAttendance(programId);
      setAttendance(data);
    } catch {
      showToast("Failed to load attendance for this program", "error");
    }
  };

  const toggleAttendance = async (memberId: string) => {
    if (!selectedProgram || isUpdating) return;
    const previousValue = attendance[memberId];
    const newValue = !previousValue;
    
    // Optimistic update
    setAttendance((prev) => ({ ...prev, [memberId]: newValue }));
    
    try {
      setIsUpdating(true);
      await markAttendance(selectedProgram, memberId, newValue);
    } catch {
      // Rollback
      setAttendance((prev) => ({ ...prev, [memberId]: previousValue }));
      showToast("Failed to update attendance.", "error");
    } finally {
      setIsUpdating(false);
    }
  };

  const currentCount = members.filter((m) => attendance[m.id]).length;
  const progressPct = members.length > 0 ? Math.round((currentCount / members.length) * 100) : 0;

  return (
    <div className={styles.page}>
      {/* Toast Notification */}
      {toast && (
        <div className={`${styles.toast} ${styles[`toast${toast.type}`]}`}>
          {toast.type === "success" ? "✅" : "❌"} {toast.message}
        </div>
      )}

      {/* Header */}
      <div className={styles.pageHeader}>
        <div>
          <h1 className={styles.heading}>Attendance Tracker</h1>
          <p className={styles.subheading}>Record and monitor member presence for church events</p>
        </div>
      </div>

      {/* Program Selector Card */}
      <div className={styles.selectCard}>
        <div className={styles.selectInfo}>
          <h3>Select a Program</h3>
          <p>Choose an event to record live attendance</p>
        </div>
        <select
          id="program-select"
          className={styles.selectBox}
          onChange={(e) => changeProgramHandler(e.target.value)}
          value={selectedProgram}
          disabled={isLoading}
        >
          <option value="">Select a Program</option>
          {programs.map((p) => (
            <option key={p.id} value={p.id}>
              {p.title} — {new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
            </option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <p className={styles.emptyText}>Loading attendance data...</p>
      ) : !selectedProgram ? (
        <div className={styles.emptyState}>
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#b7dcca" strokeWidth="1.5">
            <polyline points="9 11 12 14 22 4"></polyline>
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
          </svg>
          <p className={styles.emptyTitle}>No program selected</p>
          <p className={styles.emptyText} style={{ padding: 0 }}>Select a program above to begin taking attendance.</p>
        </div>
      ) : members.length === 0 ? (
        <p className={styles.emptyText}>No members found in registry.</p>
      ) : (
        <div className={styles.attendanceContainer}>
          {/* Summary Banner */}
          <div className={styles.summaryBanner}>
            <div className={styles.summaryStats}>
              <span className={styles.summaryCount}>{currentCount}</span>
              <span className={styles.summaryLabel}>present out of {members.length}</span>
            </div>
            <div className={styles.progressBarWrap}>
              <div className={styles.progressBar} style={{ width: `${progressPct}%` }} />
            </div>
            <span className={styles.progressText}>{progressPct}% Attendance</span>
          </div>

          {/* Members Table */}
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th style={{ width: "60px" }}></th>
                  <th>Member Name</th>
                  <th>Department</th>
                  <th className={styles.checkCell}>Present</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => {
                  const isPresent = attendance[m.id] ?? false;
                  const fullName = `${m.firstName} ${m.lastName}`;
                  return (
                    <tr key={m.id} className={isPresent ? styles.present : ""}>
                      <td style={{ width: "60px", paddingRight: 0 }}>
                        <div className={`${styles.avatar} ${getAvatarColor(fullName)}`}>
                          {getInitials(fullName)}
                        </div>
                      </td>
                      <td>
                        <span className={styles.memberName}>{fullName}</span>
                      </td>
                      <td>
                        <span className={`${styles.badge} ${styles.badgeDept}`}>{m.department}</span>
                      </td>
                      <td className={styles.checkCell}>
                        <label className={styles.checkboxWrapper}>
                          <input
                            type="checkbox"
                            className={styles.checkbox}
                            checked={isPresent}
                            onChange={() => toggleAttendance(m.id)}
                            disabled={isUpdating}
                            aria-label={`Mark ${fullName} as present`}
                          />
                          <span className={styles.customCheck}></span>
                        </label>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
