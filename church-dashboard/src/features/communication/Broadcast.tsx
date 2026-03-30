import { useState, useCallback, useEffect } from "react";
import {
  getBroadcasts,
  sendBroadcasts,
} from "../../services/broadcastServices";
import type {
  Broadcast,
  BroadcastChannel,
  MemberDepartment,
} from "../../types/church.types";
import styles from "./Broadcast.module.scss";

const CHANNELS: BroadcastChannel[] = ["Email", "SMS", "Both"];
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

    type BroadcastTabProps = {
  currentUserName: string;
  onNotify: (msg: string, type?: "success" | "error") => void;
};

export const BroadcastTab = ({ currentUserName, onNotify }: BroadcastTabProps) => {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [form, setForm] = useState({
    subject: "",
    message: "",
    channel: "Email" as BroadcastChannel,
    targetDepartment: null as MemberDepartment | null,
  });

  const fetchBroadcasts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getBroadcasts();
      setBroadcasts(data);
    } catch {
      onNotify("Failed to load broadcast history.", "error");
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    fetchBroadcasts();
  }, [fetchBroadcasts]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      onNotify("Subject and message are required.", "error");
      return;
    }
    try {
      setSending(true);
      await sendBroadcasts({
        ...form,
        sentAt: new Date().toISOString(),
        sentBy: currentUserName,
        recipientCount: 0,
        status: "Sent",
      });
      setForm({
        subject: "",
        message: "",
        channel: "Email",
        targetDepartment: null,
      });
      await fetchBroadcasts();
      onNotify("Broadcast logged successfully.");
    } catch {
      onNotify("Failed to send broadcast.", "error");
    } finally {
      setSending(false);
    }
  };

  return (
    <div data-testid="broadcast-tab">
      <div className={styles.broadcastNotice}>
        Broadcasts are logged here. Connect a Firebase Cloud Function to deliver
        via SendGrid (email) or Twilio (SMS).
      </div>

      <form onSubmit={handleSend} className={styles.inlineForm}>
        <input
          placeholder="Subject *"
          value={form.subject}
          onChange={(e) => setForm((p) => ({ ...p, subject: e.target.value }))}
          disabled={sending}
          required
        />
        <textarea
          placeholder="Message body *"
          value={form.message}
          onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
          rows={4}
          disabled={sending}
          required
        />
        <div className={styles.formRow}>
          <select
            value={form.channel}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                channel: e.target.value as BroadcastChannel,
              }))
            }
            disabled={sending}
          >
            {CHANNELS.map((c) => (
              <option key={c} value={c}>
                {c}
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
            disabled={sending}
          >
            <option value="">All departments</option>
            {DEPARTMENTS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className={styles.primaryBtn}
          disabled={sending}
        >
          {sending ? "Sending..." : "Send Broadcast"}
        </button>
      </form>

      <h3 className={styles.sectionHeading}>Broadcast history</h3>

      {loading ? (
        <p className={styles.stateMsg}>Loading history...</p>
      ) : (
        <div className={styles.broadcastList}>
          {broadcasts.map((b) => (
            <div key={b.id} className={styles.broadcastRow}>
              <div className={styles.broadcastMeta}>
                <span className={styles.channel}>{b.channel}</span>
                {b.targetDepartment && (
                  <span className={styles.dept}>{b.targetDepartment}</span>
                )}
                <span
                  className={`${styles.statusDot} ${
                    b.status === "Sent" ? styles.statusSent : styles.statusFailed
                  }`}
                >
                  {b.status}
                </span>
              </div>
              <p className={styles.broadcastSubject}>{b.subject}</p>
              <p className={styles.broadcastBody}>{b.message}</p>
              <footer className={styles.cardFooter}>
                <span>{b.sentBy}</span>
                <time dateTime={b.sentAt}>
                  {new Date(b.sentAt).toLocaleDateString("en-UG", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </time>
              </footer>
            </div>
          ))}
          {broadcasts.length === 0 && (
            <p className={styles.stateMsg}>No broadcasts sent yet.</p>
          )}
        </div>
      )}
    </div>
  );
};