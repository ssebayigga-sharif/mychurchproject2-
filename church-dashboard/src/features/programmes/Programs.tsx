import { useEffect, useState } from "react";
import type { Program } from "../../types/Program";
import {
  addProgram,
  deleteProgram,
  getPrograms,
  updateProgram,
} from "../../services/programServices";
import { ProgramModal } from "./ProgramModal";

export const Programs = () => {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Program | undefined>();
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetchPrograms();
  }, []);

  const fetchPrograms = async () => {
    const data = await getPrograms();
    setPrograms(data);
  };

  const addProgramHandler = () => {
    setEditingProgram(undefined);
    setModalOpen(true);
  };

  const editProgramHandler = (program: Program) => {
    setEditingProgram(program);
    setModalOpen(true);
  };

  const deleteProgramHandler = async (id: string) => {
    if (confirm("Delete This Program")) {
      await deleteProgram(id);
      fetchPrograms();
    }
  };

  const saveProgramHandler = async (program: Program) => {
    if (program.id) {
      await updateProgram(program.id, program);
    } else {
      await addProgram(program);
    }

    setModalOpen(false);
    fetchPrograms();
  };

  const filterPrograms = programs.filter(
    (p) =>
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.speaker.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div>
      <h2>Sabbath Programs</h2>
      <div className="page-actions">
        <button onClick={addProgramHandler}>Add Program</button>
        <input
          placeholder=" Search Programs...."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Date</th>
            <th>Speaker</th>
            <th>Theme</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {filterPrograms.map((p) => (
            <tr key={p.id}>
              <td>{p.title}</td>
              <td>{p.date}</td>
              <td>{p.speaker}</td>
              <td>{p.theme}</td>
              <td>{p.status}</td>
              <td>
                <button onClick={() => editProgramHandler(p)}>Edit</button>
                <button onClick={() => deleteProgramHandler(p.id!)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <ProgramModal
        visible={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={saveProgramHandler}
        program={editingProgram}
      />
    </div>
  );
};
