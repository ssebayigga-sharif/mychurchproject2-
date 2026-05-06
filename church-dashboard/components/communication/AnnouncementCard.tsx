import type { Announcement, AnnouncementPriority } from "../../lib/types/church.types";
import styles from "../../styles/modules/AnnouncementCard.module.scss";

type AnnouncementCardProps = {
  item: Announcement;
  currentUserName: string;
  onMarkRead: (a: Announcement) => void;
  onArchive: (id: string) => void;
};
//priority badge;

const PriorityBadge = ({ priority }: { priority: AnnouncementPriority }) => (
  <span
    className={`${styles.badge} ${styles[`badge${priority}`]}`}
  >
    {priority}
  </span>
);

export const AnnouncementCard = ({
  item,
  currentUserName,
  onMarkRead,
  onArchive,
}: AnnouncementCardProps) => {
  const readBy = item.readBy || [];
  const isRead = readBy.includes(currentUserName);

  return (
    <article
      className={`${styles.card} ${isRead ? styles.cardRead : styles.cardUnread}`}
    >
      <div className={styles.cardTop}>
        <div className={styles.cardMeta}>
          <PriorityBadge priority={item.priority} />
          <span className={styles.category}>{item.category}</span>
          {item.targetDepartment && (
            <span className={styles.dept}>{item.targetDepartment}</span>
          )}
        </div>
        <div className={styles.cardActions}>
          {!isRead && (
            <button
              className={styles.readBtn}
              onClick={() => onMarkRead(item)}
            >
              Mark read
            </button>
          )}
          <button
            className={styles.archiveBtn}
            onClick={() => onArchive(item.id)}
          >
            Archive
          </button>
        </div>
      </div>

      <h3 className={styles.cardTitle}>{item.title}</h3>
      <p className={styles.cardBody}>{item.body}</p>

      <footer className={styles.cardFooter}>
        <span>{item.authorName || "System"}</span>
        <time dateTime={item.createdAt}>
          {item.createdAt ? (
            new Date(item.createdAt).toLocaleDateString("en-UG", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          ) : "N/A"}
        </time>
        <span className={styles.readCount}>{readBy.length} read</span>
      </footer>
    </article>
  );
};
