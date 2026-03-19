import axios from "axios";
const BASE_URL =
  "https://my-church-9abc5-default-rtdb.firebaseio.com/attendance";

export const getAttendance = async (programId: string) => {
  const res = await axios.get(`${BASE_URL}/${programId}.json`);
  return res.data || {};
};

export const markAttendance = async (
  programId: string,
  memberId: string,
  present: boolean,
) => {
  await axios.put(`${BASE_URL}/${programId}/${memberId}.json`, present);
};
