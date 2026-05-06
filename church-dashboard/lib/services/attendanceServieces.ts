import axios from "axios";
import type { AttendanceMap } from "../types/church.types";

const BASE_URL =
  "https://my-church-9abc5-default-rtdb.firebaseio.com/attendance";

export const getAttendance = async (
  programId: string,
): Promise<AttendanceMap> => {
  const res = await axios.get<AttendanceMap | null>(`${BASE_URL}/${programId}.json`);
  return res.data || {};
};

export const markAttendance = async (
  programId: string,
  memberId: string,
  present: boolean,
): Promise<void> => {
  await axios.put(`${BASE_URL}/${programId}/${memberId}.json`, present);
};

