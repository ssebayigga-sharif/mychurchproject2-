import { useEffect, useState } from "react";
import { Close } from "@carbon/icons-react";
import styles from "../../styles/modules/ProgramModal.module.scss";
import { Button } from "@carbon/react";
import type {
  Program,
  ProgramStatus,
  CreateProgramInput,
} from "../../lib/types/church.types";

type ProgramModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (data: CreateProgramInput, id?: string) => void;
  program?: Program;
};

const DEFAULT_FORM: CreateProgramInput = {
  title: "",
  date: "",
  speaker: "",
  theme: "",
  type: "sabbath School",
  status: "Upcoming",
};

export const ProgramModal = ({
  visible,
  onClose,
  onSave,
  program,
}: ProgramModalProps) => {
  const [form, setForm] = useState<CreateProgramInput>(DEFAULT_FORM);

  useEffect(() => {
    if (program) {
      const { id: _id, createdAt: _createdAt, ...editableFields } = program;
      setForm(editableFields);
    } else {
      setForm(DEFAULT_FORM);
    }
  }, [program, visible]);

  const changeProgramHander = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const submitProgramHandler = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form, program?.id);
  };

  const isEditing = Boolean(program);

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
        aria-label={isEditing ? "Edit Program" : "Schedule New Program"}
      >
        {/* Panel header */}
        <div className={styles.header}>
          <div>
            <h2 className={styles.title}>
              {isEditing ? "Edit Program" : "Schedule New Program"}
            </h2>
            <p className={styles.subtitle}>
              {isEditing
                ? "Update details for this scheduled event."
                : "Add a new program to the church calendar."}
            </p>
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
          <form id="program-form" onSubmit={submitProgramHandler} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="prog-title">Program Title</label>
              <input
                id="prog-title"
                name="title"
                placeholder="e.g. Divine Service"
                value={form.title}
                onChange={changeProgramHander}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="prog-date">Event Date</label>
              <input
                id="prog-date"
                type="date"
                name="date"
                value={form.date}
                onChange={changeProgramHander}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="prog-speaker">Lead Speaker / Presenter</label>
              <input
                id="prog-speaker"
                name="speaker"
                placeholder="e.g. Pr. John Doe"
                value={form.speaker}
                onChange={changeProgramHander}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="prog-theme">Program Theme / Topic</label>
              <input
                id="prog-theme"
                name="theme"
                placeholder="e.g. The Second Coming"
                value={form.theme}
                onChange={changeProgramHander}
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="prog-status">Event Status</label>
              <select
                id="prog-status"
                name="status"
                value={form.status}
                onChange={changeProgramHander}
              >
                <option value={"Upcoming" satisfies ProgramStatus}>
                  Upcoming
                </option>
                <option value={"Completed" satisfies ProgramStatus}>
                  Completed
                </option>
              </select>
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
            form="program-form"
          >
            {isEditing ? "Save Changes" : "Create Program"}
          </Button>
        </div>
      </aside>
    </>
  );
};
