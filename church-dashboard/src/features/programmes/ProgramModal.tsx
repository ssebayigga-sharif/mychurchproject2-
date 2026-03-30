import { useEffect, useState } from "react";
import styles from "./ProgramModal.module.scss";
import type {
  Program,
  ProgramStatus,
  CreateProgramInput,
} from "../../types/church.types";

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
  if (!visible) return null;

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
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div 
        className={styles.modalCard} 
        role="dialog" 
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.header}>
          <h3>{isEditing ? "Edit Program" : "Schedule New Program"}</h3>
          <p>{isEditing ? "Update details for this scheduled event." : "Add a new program to the church calendar."}</p>
        </div>

        <form onSubmit={submitProgramHandler} className={styles.form}>
          <div className={styles.inputGroup}>
            <label>Program Title</label>
            <input
              name="title"
              placeholder="e.g. Divine Service"
              value={form.title}
              onChange={changeProgramHander}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Event Date</label>
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={changeProgramHander}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Lead Speaker / Presenter</label>
            <input
              name="speaker"
              placeholder="e.g. Pr. John Doe"
              value={form.speaker}
              onChange={changeProgramHander}
              required
            />
          </div>
          
          <div className={styles.inputGroup}>
            <label>Program Theme / Topic</label>
            <input
              name="theme"
              placeholder="e.g. The Second Coming"
              value={form.theme}
              onChange={changeProgramHander}
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label>Event Status</label>
            <select
              name="status"
              value={form.status}
              onChange={changeProgramHander}
            >
              <option value={"Upcoming" satisfies ProgramStatus}>Upcoming</option>
              <option value={"Completed" satisfies ProgramStatus}>Completed</option>
            </select>
          </div>

          <div className={styles.modalActions}>
            <button type="button" className={styles.btnCancel} onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className={styles.btnSave}>
              {isEditing ? "Save Changes" : "Create Program"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
