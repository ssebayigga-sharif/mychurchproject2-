import { useEffect, useState } from "react";
import { getMembers } from "../../services/memberServices";
import { getPrograms } from "../../services/programServices";
import {
  getAttendance,
  markAttendance,
} from "../../services/attendanceServieces";

export const Attendance = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [programs, setPrograms] = useState<any[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<string>("");
  const [attendance, setattendance] = useState<any>({});

  useEffect(() => {
    LoadData();
  }, []);

  const LoadData = async () => {
    const m = await getMembers();
    const p = await getPrograms();
    setMembers(m);
    setPrograms(p);
  };

  const changeProgramHandler = async (programId: string) => {
    setSelectedProgram(programId);
    const data = await getAttendance(programId);
    setattendance(data);
  };

  const toggleAttendance = async (memberId: string) => {
    const newValue = !attendance[memberId];
    await markAttendance(selectedProgram, memberId, newValue);
    setattendance({
      ...attendance,
      [memberId]: newValue,
    });
  };

  return (
    <div>
      <h2>Attendance</h2>
      <select onChange={(e) => changeProgramHandler(e.target.value)}>
        <option>Select Program</option>

        {programs.map((p) => (
          <option key={p.id} value={p.id}>
            {p.title}-{p.date}
          </option>
        ))}
      </select>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Present</th>
          </tr>
        </thead>
        <tbody>
          {members.map((m) => (
            <tr key={m.id}>
              <td>
                {m.firstName} {m.lastName}
              </td>

              <td>
                <input
                  type="checkbox"
                  checked={attendance[m.id] || false}
                  onChange={() => toggleAttendance(m.id)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
