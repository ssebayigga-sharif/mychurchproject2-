import { useState } from "react";
import { Button } from "@carbon/react";
import { Close } from "@carbon/icons-react";
import type {
  CreatePrayerRequestInput,
  PrayerCategory,
} from "../../lib/types/church.types";
import styles from "../../styles/modules/PrayerModal.module.scss";

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

  const changeHandler = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const checkboxHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, isPrivate: e.target.checked }));
  };

  const saveForm = () => {
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
    onClose();
  };

  const formSubmitHandler = (e: React.FormEvent) => {
    e.preventDefault();
    saveForm();
  };

  const canSubmit = form.name.trim() !== "" && form.request.trim() !== "";

  return (
    <>
      {/* Semi-transparent backdrop */}
      <div
        className={`${styles.backdrop} ${visible ? styles.open : ""}`}
        onClick={onClose}
      />

      {/* Slide-in panel */}
      <aside
        className={`${styles.panel} ${visible ? styles.open : ""}`}
        aria-label="New Prayer Request"
      >
        {/* Panel header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>New Prayer Request</h2>
            <p className={styles.subtitle}>Submit a request for prayer support.</p>
          </div>
          <button
            className={styles.closeBtn}
            onClick={onClose}
            aria-label="Close panel"
            type="button"
          >
            <Close size={20} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className={styles.body}>
          <form id="prayer-form" onSubmit={formSubmitHandler} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="prayer-name">Full Name</label>
              <input
                id="prayer-name"
                name="name"
                placeholder="e.g. Jane Doe"
                value={form.name}
                onChange={changeHandler}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="prayer-category">Prayer Request Category</label>
              <select
                id="prayer-category"
                name="category"
                value={form.category}
                onChange={changeHandler}
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="prayer-request">Your Prayer Request</label>
              <textarea
                id="prayer-request"
                name="request"
                placeholder="What would you like to be prayed for"
                value={form.request}
                onChange={changeHandler}
                required
                maxLength={500}
                rows={5}
              />
            </div>

            <div className={`${styles.inputGroup} ${styles.checkboxGroup}`}>
              <input
                type="checkbox"
                id="prayer-isPrivate"
                name="isPrivate"
                checked={form.isPrivate}
                onChange={checkboxHandler}
              />
              <label htmlFor="prayer-isPrivate">
                Keep this request Private to church Leaders
              </label>
            </div>
          </form>
        </div>

        {/* Footer with actions */}
        <div className={styles.footer}>
          <Button kind="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            kind="primary"
            type="submit"
            form="prayer-form"
            disabled={!canSubmit}
          >
            Submit Request
          </Button>
        </div>
      </aside>
    </>
  );
};
