import axios from "axios";
import type { Member, CreateMemberInput } from "../types/church.types";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/members";

export const getMembers = async (): Promise<Member[]> => {
  const res = await axios.get<Record<string, Omit<Member, "id">>>(
    `${BASE_URL}.json`,
  );
  const data = res.data;

  return data
    ? Object.entries(data).map(([id, value]) => ({ id, ...value }))
    : [];
};

export const addMember = async (member: CreateMemberInput): Promise<void> => {
  await axios.post(`${BASE_URL}.json`, member);
};

export const updateMember = async (
  id: string,
  member: Partial<CreateMemberInput>,
): Promise<void> => {
  await axios.patch(`${BASE_URL}/${id}.json`, member);
};

export const deleteMember = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}.json`);
};
