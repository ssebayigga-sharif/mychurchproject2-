import { useState, useEffect, useCallback } from "react";
import { getLeaders, addLeader, removeLeader } from "../../services/leadersServices";
import { getMembers } from "../../services/memberServices";
import type { Leader, Member, LeaderPosition, MemberDepartment, CreateLeaderInput } from "../../types/church.types";
import styles from "./leaders.module.scss";

const POSITIONS: LeaderPosition[] = ["Pastor", "Elder", "Deacon", "Deaconess", "Treasurer", "Clerk", "Department Head"];
const DEPARTMENTS: MemberDepartment[] = ["Sabbath School", "Children", "Youth", "Music", "Deacons", "Deaconesses", "Health", "Communication", "Elders", "Personal Ministries", "Community Services"];

export const Leaders = () => {
  const [leaders, setLeaders] = useState<Leader[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState<Omit<CreateLeaderInput, "name">>({
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
      const [l, m] = await Promise.all([getLeaders(), getMembers()]);
      setLeaders(l);
      setMembers(m);
    } catch (error) {
      console.error("Failed to fetch leaders", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const member = members.find(m => m.id === form.memberId);
    if (!member) return;

    try {
      setSubmitting(true);
      await addLeader({
        ...form,
        name: `${member.firstName} ${member.lastName}`,
      });
      setShowModal(false);
      fetchData();
    } catch (error) {
      console.error("Failed to add leader", error);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemove = async (id: string) => {
    if (!window.confirm("Remove this leader?")) return;
    try {
      await removeLeader(id);
      fetchData();
    } catch (error) {
      console.error("Failed to remove leader", error);
    }
  };

  const filtered = leaders.filter(l => 
    l.name.toLowerCase().includes(search.toLowerCase()) ||
    l.position.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1>Church Leadership</h1>
        <button className={styles.primaryBtn} onClick={() => setShowModal(true)}>
          + Assign Leader
        </button>
      </header>

      <div className={styles.toolbar}>
        <div className={styles.searchBox}>
          <input 
            placeholder="Search leaders by name or position..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className={styles.emptyState}>Loading leadership data...</div>
      ) : filtered.length > 0 ? (
        <div className={styles.grid}>
          {filtered.map(leader => (
            <div key={leader.id} className={styles.card}>
              <div className={styles.actions}>
                <button className={styles.removeBtn} onClick={() => handleRemove(leader.id)} title="Remove leader">
                  ✕
                </button>
              </div>
              <div className={styles.avatar}>
                {leader.name.split(" ").map((n: string) => n[0]).join("")}
              </div>
              <h3 className={styles.name}>{leader.name}</h3>
              <span className={styles.position}>{leader.position}</span>
              {leader.department && <p className={styles.dept}>{leader.department}</p>}
              <div className={styles.term}>
                <span>Term: {leader.termStart} - {leader.termEnd || "Present"}</span>
                <span style={{ color: leader.isActive ? "#10b981" : "#ef4444" }}>
                  ● {leader.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          {search ? "No leaders match your search." : "No leaders assigned yet."}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <h2>Assign New Leader</h2>
            <form onSubmit={handleAdd} className={styles.form}>
              <label>
                Select Member
                <select 
                  value={form.memberId} 
                  onChange={e => setForm({...form, memberId: e.target.value})}
                  required
                >
                  <option value="">Select a member...</option>
                  {members.map(m => (
                    <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                  ))}
                </select>
              </label>

              <label>
                Leadership Position
                <select 
                  value={form.position} 
                  onChange={e => setForm({...form, position: e.target.value as any})}
                >
                  {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </label>

              <label>
                Department (Optional)
                <select 
                  value={form.department || ""} 
                  onChange={e => setForm({...form, department: (e.target.value as any) || undefined})}
                >
                  <option value="">None</option>
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </label>

              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                  {submitting ? "Saving..." : "Save Assignment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
