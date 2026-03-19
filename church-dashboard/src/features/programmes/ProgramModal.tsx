import { useEffect, useState } from "react";
import type { Program } from "../../types/Program";

type ProgramModalProps = {
  visible: boolean;
  onClose: () => void;
  onSave: (program: Program) => void;
  program?: Program;
};

export const ProgramModal = ({
  visible,
  onClose,
  onSave,
  program,
}: ProgramModalProps) => {
  //if (!program) return null;
  const [form, setForm] = useState<Program>({
    title: "",
    date: "",
    speaker: "",
    theme: "",
    status: "Upcoming",
    createdAt: new Date().toISOString(),
  });

  useEffect(() => {
    if (program) {
      setForm(program);
    }
  }, [program]);
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
    onSave(form);
  };

  return (
    <div className="modale-backdrop">
      <div className="modal">
        <h3>{program ? "EditProgram" : "Add Program"}</h3>

        <form onSubmit={submitProgramHandler}>
          <input
            name="title"
            placeholder="Program Title"
            value={form.title}
            onChange={changeProgramHander}
            required
          />
          <input
            type="date"
            name="date"
            placeholder="Date of the program"
            value={form.date}
            onChange={changeProgramHander}
            required
          />
          <input
            name="speaker"
            placeholder="speaker"
            value={form.speaker}
            onChange={changeProgramHander}
            required
          />
          <input
            name="theme"
            placeholder="Theme"
            value={form.theme}
            onChange={changeProgramHander}
            required
          />
          <select
            name="status"
            value={form.status}
            onChange={changeProgramHander}
          >
            <option value={"upcoming"}>Upcoming</option>
            <option value={"completed"}>Completed</option>
          </select>
          <div className="modal-actions">
            <button type="submit">Save</button>
            <button type="button" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
