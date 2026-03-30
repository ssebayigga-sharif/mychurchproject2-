import { useState } from "react";
import type {
  CreatePrayerRequestInput,
  PrayerCategory,
} from "../../types/church.types";
import styles from "./PrayerModal.module.scss";
type PrayerModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreatePrayerRequestInput) => void;
};

const CATEGORIES: PrayerCategory[] = [
  "Health",
  "Family",
  "Financial",
  "Spiritual Growth",
  "Bereavement",
  "Thanks Giving",
  "Other",
];

const DEFAULT_FORM = {
  name: "",
  request: "",
  category: "Health" as PrayerCategory,
  isPrivate: false,
};
export const PrayerModal = ({ visible, onClose, onSave }: PrayerModalProps) => {
  const [form, setForm] = useState(DEFAULT_FORM);
  if (!visible) return null;

  const changeHandler = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };
  const checkboxHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    setForm((prev) => ({ ...prev, isPrivate: checked }));
  };
  const submitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      name: form.name,
      category: form.category,
      request: form.request,
      isPrivate: form.isPrivate,
      status: "Pending",
      prayerCount: 0,
      createdAt: new Date().toISOString(),
    });
    setForm(DEFAULT_FORM);
  };
  return (
    <div className={styles.backdrop}>
      <div className={styles.modal} role="dialog" aria-modal="true">
        <div className={styles.modalHeader}>
          <h3>Submit a prayer request</h3>
          <button className={styles.closeBtn} onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={submitHandler}>
          <div className={styles.modalBody}>
            <div className={styles.field}>
              <label>Your name</label>
              <input
                name="name"
                placeholder="Full name"
                value={form.name}
                onChange={changeHandler}
                required
              />
            </div>

            <div className={styles.field}>
              <label>Category</label>
              <select
                name="category"
                value={form.category}
                onChange={changeHandler}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.field}>
              <label>Prayer request</label>
              <textarea
                name="request"
                placeholder="Share what you'd like the church to pray for..."
                value={form.request}
                onChange={changeHandler}
                rows={4}
                required
                maxLength={500}
              />
              <span className={styles.charCount}>
                {form.request.length} / 500
              </span>
            </div>

            <label className={styles.checkboxField}>
              <input
                type="checkbox"
                checked={form.isPrivate}
                onChange={checkboxHandler}
              />
              <span>Keep this request private (visible to leaders only)</span>
            </label>
          </div>

          <div className={styles.modalFooter}>
            <button
              type="button"
              className={styles.btnCancel}
              onClick={onClose}
            >
              Cancel
            </button>
            <button type="submit" className={styles.btnSave}>
              Submit Prayer Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
