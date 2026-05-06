"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Column,
  DataTable,
  Grid,
  Loading,
  Select,
  SelectItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableHeader,
  TableRow,
  Checkbox,
  ProgressBar,
  ToastNotification,
  Section,
} from "@carbon/react";
import { getMembers } from "../../../lib/services/memberServices";
import { getPrograms } from "../../../lib/services/programServices";
import styles from "../../../styles/modules/Attendance.module.scss";
import {
  getAttendance,
  markAttendance,
} from "../../../lib/services/attendanceServieces";
import type {
  Member,
  AttendanceMap,
  Program,
} from "../../../lib/types/church.types";

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
  for (let i = 0; i < name.length; i++)
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};

export default function Attendance() {
  const [members, setMembers] = useState<Member[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [attendance, setAttendance] = useState<AttendanceMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = (
    message: string,
    type: "success" | "error" = "success",
  ) => {
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
    if (!programId) {
      setSelectedProgram("");
      setAttendance({});
      return;
    }
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
  const progressPct = members.length > 0 ? currentCount / members.length : 0;

  const headers = [
    { key: "avatar", header: "" },
    { key: "name", header: "Member Name" },
    { key: "department", header: "Department" },
    { key: "present", header: "Present" },
  ];

  const rows = members.map((m) => {
    const fullName = `${m.firstName} ${m.lastName}`;
    return {
      id: m.id,
      avatar: fullName,
      name: fullName,
      department: m.department,
      present: !!attendance[m.id],
    };
  });

  return (
    <div className={styles.page}>
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <div className={styles.pageHeader}>
            <div>
              <h2 className={styles.title}>Attendance Tracker</h2>
              <p className={styles.subtitle}>
                Record and monitor member presence for church events
              </p>
            </div>
            {toast && (
              <div className={styles.toastContainer}>
                <ToastNotification
                  kind={toast.type === "success" ? "success" : "error"}
                  title={toast.type === "success" ? "Success" : "Error"}
                  subtitle={toast.message}
                  onClose={() => setToast(null)}
                  timeout={3000}
                />
              </div>
            )}
          </div>

          <div className={styles.selectionSection}>
            <Select
              id="program-select-carbon"
              labelText="Select a Program"
              helperText="Choose an event to record live attendance"
              value={selectedProgram}
              onChange={(e) => changeProgramHandler(e.target.value)}
              disabled={isLoading}
            >
              <SelectItem value="" text="Select a Program..." />
              {programs.map((p) => (
                <SelectItem
                  key={p.id}
                  value={p.id}
                  text={`${p.title} â€” ${new Date(p.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
                />
              ))}
            </Select>
          </div>

          {isLoading ? (
            <Loading withOverlay={false} />
          ) : !selectedProgram ? (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>No program selected</p>
              <p className={styles.emptyText}>
                Choose a program from the list above to begin recording
                attendance.
              </p>
            </div>
          ) : members.length === 0 ? (
            <p className={styles.emptyText}>No members found in registry.</p>
          ) : (
            <Section className={styles.attendanceContent}>
              <div className={styles.summaryStats}>
                <ProgressBar
                  label="Total Attendance"
                  helperText={`${currentCount} present out of ${members.length} members`}
                  value={progressPct * 100}
                  status="active"
                  className={styles.progressBar}
                />
              </div>

              <div className={styles.tableWrapper}>
                <DataTable rows={rows} headers={headers}>
                  {({
                    rows,
                    headers,
                    getHeaderProps,
                    getTableProps,
                    getTableContainerProps,
                  }) => (
                    <TableContainer
                      {...getTableContainerProps()}
                      title="Member Registry"
                    >
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
                          {rows.map((row) => (
                            <TableRow key={row.id}>
                              {row.cells.map((cell) => {
                                if (cell.info.header === "avatar") {
                                  return (
                                    <TableCell
                                      key={cell.id}
                                      className={styles.avatarCell}
                                    >
                                      <div
                                        className={`${styles.avatar} ${getAvatarColor(cell.value)}`}
                                      >
                                        {getInitials(cell.value)}
                                      </div>
                                    </TableCell>
                                  );
                                }
                                if (cell.info.header === "present") {
                                  const mId = row.id;
                                  return (
                                    <TableCell
                                      key={cell.id}
                                      className={styles.checkCell}
                                    >
                                      <Checkbox
                                        id={`check-${mId}`}
                                        labelText=""
                                        checked={cell.value}
                                        onChange={() => toggleAttendance(mId)}
                                        disabled={isUpdating}
                                      />
                                    </TableCell>
                                  );
                                }
                                return (
                                  <TableCell key={cell.id}>
                                    {cell.value}
                                  </TableCell>
                                );
                              })}
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </TableContainer>
                  )}
                </DataTable>
              </div>
            </Section>
          )}
        </Column>
      </Grid>
    </div>
  );
}
