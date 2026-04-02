import { Button, Tag, Tile } from "@carbon/react";
import { Checkmark, TrashCan, UserAvatar } from "@carbon/icons-react";
import type { PrayerRequest } from "../../types/church.types";
import styles from "./PrayerCard.module.scss";

type PrayerCardProps = {
  prayer: PrayerRequest;
  onPrayForIt: (prayer: PrayerRequest) => void;
  onMarkAnswered: (prayer: PrayerRequest) => void;
  onDelete: (prayer: PrayerRequest) => void;
};

// Map categories to official Carbon Tag types
const getCategoryTagType = (
  category: string,
): "red" | "magenta" | "purple" | "blue" | "cyan" | "teal" | "green" | "gray" | "cool-gray" | "warm-gray" => {
  switch (category) {
    case "Health":
      return "red";
    case "Family":
      return "magenta";
    case "Financial":
      return "green";
    case "Spiritual Growth":
      return "blue";
    case "Thanks Giving":
      return "cyan";
    case "Bereavement":
      return "cool-gray";
    default:
      return "purple";
  }
};

export const PrayerCard = ({
  prayer,
  onPrayForIt,
  onMarkAnswered,
  onDelete,
}: PrayerCardProps) => {
  const isCompleted = prayer.status === "Completed";

  return (
    <Tile className={styles.cardContainer}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <UserAvatar size={24} className={styles.avatarIcon} />
          <span className={styles.userName}>{prayer.name}</span>
          {prayer.isPrivate && (
            <Tag type="red" size="sm" className={styles.tagSpacing}>
              Private
            </Tag>
          )}
          <Tag type={getCategoryTagType(prayer.category)} size="sm" className={styles.tagSpacing}>
            {prayer.category}
          </Tag>
        </div>
        <div className={styles.dateInfo}>
          {new Date(prayer.createdAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Request body */}
      <div className={styles.requestBody}>
        <p>{prayer.request}</p>
      </div>

      {/* Footer / Actions */}
      <div className={styles.footer}>
        <div className={styles.stats}>
          <span>
            {prayer.prayerCount} {prayer.prayerCount === 1 ? "person has" : "people have"} prayed
          </span>
          {isCompleted && prayer.completedAt && (
            <span className={styles.answeredDate}>
              • Answered on{" "}
              {new Date(prayer.completedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>

        <div className={styles.actions}>
          {!isCompleted && (
            <>
              <Button kind="secondary" size="sm" onClick={() => onPrayForIt(prayer)}>
                Prayed
              </Button>
              <Button
                kind="ghost"
                size="sm"
                renderIcon={Checkmark}
                onClick={() => onMarkAnswered(prayer)}
              >
                Mark Answered
              </Button>
            </>
          )}
          <Button
            kind="danger--ghost"
            size="sm"
            renderIcon={TrashCan}
            iconDescription="Delete Request"
            hasIconOnly
            onClick={() => onDelete(prayer)}
          />
        </div>
      </div>
    </Tile>
  );
};

