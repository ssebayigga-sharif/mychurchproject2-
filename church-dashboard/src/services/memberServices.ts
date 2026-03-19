import axios from "axios";
import type { Member } from "../types/Members";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/members";

export const getMembers = async (): Promise<Member[]> => {
  const res = await axios.get(`${BASE_URL}.json`);
  const data = res.data;

  return data
    ? Object.entries(data).map(([id, value]: any) => ({
        id,
        ...(value as Member),
      }))
    : [];
};
// can directly add a member from the database on firebase
export const addMember = async (member: Member) => {
  await axios.post(`${BASE_URL}.json`, member);
};
// can directly delete a member from the database on firebase
export const deleteMember = async (id: string) => {
  await axios.delete(`${BASE_URL}/${id}.json`);
};

// updating a member

export const updateMember = async (id: string, member: Partial<Member>) => {
  await axios.patch(`${BASE_URL}/${id}.json`, member);
};
