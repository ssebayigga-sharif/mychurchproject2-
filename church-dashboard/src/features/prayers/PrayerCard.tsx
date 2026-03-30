import type { PrayerRequest } from "../../types/church.types";
import styles from "./PrayerCard.module.scss";

type PrayerCardProps = {
  prayer: PrayerRequest;
  onPrayForIt: (prayer: PrayerRequest) => void;
  onMarkAnswered: (prayer: PrayerRequest) => void;
  onDelete: (prayer: PrayerRequest) => void;
};

const CATEGORY_COLORS: Record<string, string> = {
  Health: styles.catHealth,
  Family: styles.catFamily,
  Financial: styles.catFinancial,
  Bereavement: styles.catBereavement,
  "Spiritual Growth": styles.catSpiritual,
  "Thanks Giving": styles.catThanksgiving,
  Other: styles.catOther,
};

const getInitials = (name: string) => {
  if (!name) return "?";
  const words = name.trim().split(/\s+/);
  if (words.length === 1) return words[0].substring(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();//take first letter of the first word and first letter of the second word and the capitalise
};

const getAvatarColor = (name: string) => {
  const colors = [
    styles.avatarBlue,
    styles.avatarGreen,
    styles.avatarPurple,
    styles.avatarOrange,
    styles.avatarPink,
    styles.avatarTeal,
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const PrayerCard = ({
  prayer,
  onPrayForIt,
  onMarkAnswered,
  onDelete,
}: PrayerCardProps) => {
  const isCompleted = prayer.status === "Completed";
  const initials = getInitials(prayer.name);
  const avatarClass = getAvatarColor(prayer.name);

  return (
    <div
      className={`${styles.card} ${
        isCompleted ? styles.cardCompleted : ""
      }`}
    >
      {/* Card header */}
      <div className={styles.cardHeader}>
        <div className={styles.cardMeta}>
          <div className={`${styles.avatar} ${avatarClass}`}>{initials}</div>
          <div className={styles.nameAndBadges}>
            <span className={styles.name}>{prayer.name}</span>
            <div className={styles.badges}>
              {prayer.isPrivate && (
                <span className={styles.privateBadge}>Private</span>
              )}
              <span
                className={`${styles.categoryBadge} ${
                  CATEGORY_COLORS[prayer.category] || styles.catOther
                }`}
              >
                {prayer.category}
              </span>
            </div>
          </div>
        </div>
        <span className={styles.date}>
          {new Date(prayer.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </span>
      </div>

      {/* Request text */}
      <p className={styles.requestText}>{prayer.request}</p>

      {/* Card footer */}
      <div className={styles.cardFooter}>
        <div className={styles.prayerCount}>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          >
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          <span>
            {prayer.prayerCount} {prayer.prayerCount === 1 ? "person" : "people"} prayed
          </span>
        </div>

        <div className={styles.actions}>
          {!isCompleted && (
            <>
              <button
                className={styles.btnPray}
                onClick={() => onPrayForIt(prayer)}
              >
                I prayed for this
              </button>
              <button
                className={styles.btnComplete}
                onClick={() => onMarkAnswered(prayer)}
              >
                Mark answered
              </button>
            </>
          )}
          <button className={styles.btnDelete} onClick={() => onDelete(prayer)}>
            Delete
          </button>
        </div>
      </div>

      {isCompleted && prayer.completedAt && (
        <p className={styles.answeredNote}>
          Answered on{" "}
          {new Date(prayer.completedAt).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      )}
    </div>
  );
};
