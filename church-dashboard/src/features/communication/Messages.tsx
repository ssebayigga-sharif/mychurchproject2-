import { useState, useRef, useEffect, useCallback } from "react";
import { getThreads, getMessages, sendMessage as sendInternalMessage, createThread, markThreadRead } from "../../services/messageServices";
import type { MessageThread, InternalMessage } from "../../types/church.types";
import styles from "./Messages.module.scss";

type MessagesTabProps = {
  currentUserName: string;
  onNotify: (msg: string, type?: "success" | "error") => void;
};

export const MessagesTab = ({ currentUserName, onNotify }: MessagesTabProps) => {
  const [threads, setThreads] = useState<MessageThread[]>([]);
  const [activeThread, setActiveThread] = useState<MessageThread | null>(null);
  const [messages, setMessages] = useState<InternalMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [body, setBody] = useState("");
  const [newSubject, setNewSubject] = useState("");
  const [showNewThread, setShowNewThread] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const fetchThreads = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getThreads();
      setThreads(data);
    } catch {
      onNotify("Failed to load message threads.", "error");
    } finally {
      setLoading(false);
    }
  }, [onNotify]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  const openThread = useCallback(
    async (thread: MessageThread) => {
      try {
        setActiveThread(thread);
        const msgs = await getMessages(thread.id);
        setMessages(msgs);
        if (thread.unreadCount > 0) {
          await markThreadRead(thread.id);
          fetchThreads();
        }
      } catch {
        onNotify("Failed to load messages.", "error");
      }
    },
    [fetchThreads, onNotify]
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !activeThread) return;
    try {
      setSending(true);
      await sendInternalMessage({
        threadId: activeThread.id,
        senderName: currentUserName,
        body: body.trim(),
        sentAt: new Date().toISOString(),
        readBy: [currentUserName],
      });
      setBody("");
      const msgs = await getMessages(activeThread.id);
      setMessages(msgs);
    } catch {
      onNotify("Failed to send message.", "error");
    } finally {
      setSending(false);
    }
  };

  const handleNewThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubject.trim()) return;
    try {
      const threadId = await createThread(newSubject, [currentUserName]);
      setNewSubject("");
      setShowNewThread(false);
      await fetchThreads();
      const newThreads = await getThreads();
      const found = newThreads.find((t) => t.id === threadId);
      if (found) openThread(found);
    } catch {
      onNotify("Failed to create thread.", "error");
    }
  };

  return (
    <div className={styles.messagesLayout}>
      {/* Thread list */}
      <aside className={styles.threadList}>
        <div className={styles.threadListHeader}>
          <span>Threads</span>
          <button
            onClick={() => setShowNewThread((v) => !v)}
            className={styles.iconBtn}
            aria-label="Start new thread"
          >
            +
          </button>
        </div>

        {showNewThread && (
          <form onSubmit={handleNewThread} className={styles.newThreadForm}>
            <input
              placeholder="Thread subject"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              autoFocus
              required
            />
            <button type="submit" className={styles.primaryBtn}>
              Create
            </button>
          </form>
        )}

        {loading ? (
          <p className={styles.stateMsg}>Loading threads...</p>
        ) : (
          threads.map((t) => (
            <button
              key={t.id}
              className={`${styles.threadItem} ${
                activeThread?.id === t.id ? styles.threadActive : ""
              }`}
              onClick={() => openThread(t)}
            >
              <span className={styles.threadSubject}>{t.subject}</span>
              {t.unreadCount > 0 && (
                <span className={styles.unreadDot}>{t.unreadCount}</span>
              )}
              <time className={styles.threadTime}>
                {new Date(t.lastMessageAt).toLocaleDateString("en-UG", {
                  day: "numeric",
                  month: "short",
                })}
              </time>
            </button>
          ))
        )}
        {!loading && threads.length === 0 && (
          <p className={styles.stateMsg}>No threads yet.</p>
        )}
      </aside>

      {/* Message pane */}
      <section className={styles.messagePane}>
        {!activeThread ? (
          <div className={styles.emptyState}>
            Select a thread to view messages.
          </div>
        ) : (
          <>
            <header className={styles.messagePaneHeader}>
              <h3>{activeThread.subject}</h3>
            </header>

            <div className={styles.messageList}>
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={`${styles.messageBubble} ${
                    m.senderName === currentUserName
                      ? styles.bubbleOwn
                      : styles.bubbleOther
                  }`}
                >
                  {m.senderName !== currentUserName && (
                    <span className={styles.senderName}>{m.senderName}</span>
                  )}
                  <p>{m.body}</p>
                  <time>
                    {new Date(m.sentAt).toLocaleTimeString("en-UG", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </time>
                </div>
              ))}
              <div ref={bottomRef} />
            </div>

            <form onSubmit={handleSend} className={styles.composeForm}>
              <input
                placeholder="Write a message..."
                value={body}
                onChange={(e) => setBody(e.target.value)}
                disabled={sending}
                required
              />
              <button
                type="submit"
                disabled={sending || !body.trim()}
                className={styles.primaryBtn}
              >
                {sending ? "..." : "Send"}
              </button>
            </form>
          </>
        )}
      </section>
    </div>
  );
};