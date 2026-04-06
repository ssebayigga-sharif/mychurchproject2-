import { useState, useEffect, useCallback } from "react";
import {
  Button,
  Column,
  DataTable,
  Grid,
  Modal,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableContainer,
  TableToolbar,
  TableToolbarContent,
  TableToolbarSearch,
  Select,
  SelectItem,
  Loading,
  Tag,
  Stack,
  IconButton,
} from "@carbon/react";
import { Add, TrashCan } from "@carbon/icons-react";
import { getLeaders, addLeader, removeLeader } from "../../services/leadersServices";
import { getMembers } from "../../services/memberServices";
import type { Leader, Member, LeaderPosition, MemberDepartment, CreateLeaderInput } from "../../types/church.types";
import styles from "./leaders.module.scss";

const POSITIONS: LeaderPosition[] = ["Elder", "Deacon", "Deaconess", "Treasurer", "Clerk", "Department Head", "Pastor"];
const DEPARTMENTS: MemberDepartment[] = ["Sabbath School", "Children", "Youth", "Music", "Deacons", "Deaconesses", "Health", "Communication", "Elders", "Personal Ministries", "Community Services"];

export const Leaders = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState<Omit<CreateLeaderInput, "name">>({
    memberId: "",
    position: "Elder",
    department: undefined,
    termStart: new Date().getFullYear().toString(),
    termEnd: (new Date().getFullYear() + 1).toString(),
    isActive: true,
  });

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [leaderData, memberData] = await Promise.all([getLeaders(), getMembers()]);
      setLeaders(leaderData);
      setMembers(memberData);
    } catch (error) {
      console.error("Failed to fetch leaders", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddLeader = async () => {
    const member = members.find(m => m.id === formData.memberId);
    if (!member) return;

    try {
      setIsSubmitting(true);
      await addLeader({
        ...formData,
        name: `${member.firstName} ${member.lastName}`,
      });
      setIsModalOpen(false);
      setFormData({
        memberId: "",
        position: "Elder",
        department: undefined,
        termStart: new Date().getFullYear().toString(),
        termEnd: (new Date().getFullYear() + 1).toString(),
        isActive: true,
      });
      fetchData();
    } catch (error) {
      console.error("Failed to add leader", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRemoveLeader = async (id: string) => {
    if (!window.confirm("Are you sure you want to remove this leader?")) return;
    try {
      await removeLeader(id);
      fetchData();
    } catch (error) {
      console.error("Failed to remove leader", error);
    }
  };

  const headers = [
    { key: "name", header: "Name" },
    { key: "position", header: "Position" },
    { key: "department", header: "Department" },
    { key: "term", header: "Term" },
    { key: "status", header: "Status" },
    { key: "actions", header: "" },
  ];

  const filteredLeaders = leaders.filter(l => 
    l.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.position.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (l.department || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  const rows = filteredLeaders.map(leader => ({
    id: leader.id,
    name: leader.name,
    position: leader.position,
    department: leader.department || "N/A",
    term: `${leader.termStart} - ${leader.termEnd || "Present"}`,
    status: leader.isActive ? "Active" : "Inactive",
    actions: leader.id
  }));

  return (
    <div className={styles.page}>
      <Grid fullWidth>
        <Column lg={16} md={8} sm={4}>
          <div className={styles.header}>
            <div>
              <h2 className={styles.title}>Church Leadership</h2>
              <p className={styles.subtitle}>Manage and assign ecclesiastical roles</p>
            </div>
            <Button
              renderIcon={Add}
              onClick={() => setIsModalOpen(true)}
              size="lg"
            >
              Assign New Leader
            </Button>
          </div>

          <div className={styles.tableWrapper}>
            {loading ? (
              <Loading withOverlay={false} />
            ) : (
              <DataTable rows={rows} headers={headers}>
                {({
                  rows,
                  headers,
                  getHeaderProps,
                  getRowProps,
                  getTableProps,
                  getToolbarProps,
                  getTableContainerProps,
                }) => (
                  <TableContainer
                    title="Active Leadership"
                    description={`${filteredLeaders.length} leaders found`}
                    {...getTableContainerProps()}
                  >
                    <TableToolbar {...getToolbarProps()}>
                      <TableToolbarContent>
                        <TableToolbarSearch
                          persistent
                          placeholder="Filter leaders..."
                          onChange={(e: any) => setSearchQuery(e?.target?.value || "")}
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
                        {rows.map((row) => (
                          <TableRow {...getRowProps({ row })}>
                            {row.cells.map((cell) => {
                              if (cell.info.header === "status") {
                                return (
                                  <TableCell key={cell.id}>
                                    <Tag type={cell.value === "Active" ? "green" : "red"}>
                                      {cell.value}
                                    </Tag>
                                  </TableCell>
                                );
                              }
                              if (cell.info.header === "actions") {
                                return (
                                  <TableCell key={cell.id} className={styles.actionsCell}>
                                    <IconButton
                                      label="Remove Leader"
                                      kind="ghost"
                                      size="sm"
                                      onClick={() => handleRemoveLeader(row.id)}
                                      align="bottom-right"
                                    >
                                      <TrashCan />
                                    </IconButton>
                                  </TableCell>
                                );
                              }
                              return (
                                <TableCell key={cell.id}>{cell.value}</TableCell>
                              );
                            })}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </DataTable>
            )}
          </div>
        </Column>
      </Grid>

      <Modal
        open={isModalOpen}
        modalHeading="Assign New Leader"
        primaryButtonText={isSubmitting ? "Saving..." : "Save Assignment"}
        secondaryButtonText="Cancel"
        onRequestClose={() => setIsModalOpen(false)}
        onRequestSubmit={handleAddLeader}
        primaryButtonDisabled={!formData.memberId || isSubmitting}
      >
        <Stack gap={6}>
          <p className={styles.modalText}>
            Select a member from the registry and assign them to a leadership role.
          </p>
          <Select
            id="member-select"
            labelText="Select Member"
            value={formData.memberId}
            onChange={(e) => setFormData({ ...formData, memberId: e.target.value })}
            required
          >
            <SelectItem value="" text="Choose a member..." />
            {members.map((m) => (
              <SelectItem key={m.id} value={m.id} text={`${m.firstName} ${m.lastName}`} />
            ))}
          </Select>

          <Select
            id="position-select"
            labelText="Leadership Position"
            value={formData.position}
            onChange={(e) => setFormData({ ...formData, position: e.target.value as LeaderPosition })}
          >
            {POSITIONS.map((p) => (
              <SelectItem key={p} value={p} text={p} />
            ))}
          </Select>

          <Select
            id="dept-select"
            labelText="Department (Optional)"
            value={formData.department || ""}
            onChange={(e) => setFormData({ ...formData, department: (e.target.value as MemberDepartment) || undefined })}
          >
            <SelectItem value="" text="No Department" />
            {DEPARTMENTS.map((d) => (
              <SelectItem key={d} value={d} text={d} />
            ))}
          </Select>
        </Stack>
      </Modal>
    </div>
  );
};
