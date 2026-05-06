import axios from "axios";
import type { Member, CreateMemberInput } from "../types/church.types";
import { cachedRequest, invalidateCache } from "./requestCache";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/members";
const CACHE_KEY = "members";

export const getMembers = async (): Promise<Member[]> => {
  return cachedRequest(CACHE_KEY, async () => {
    const res = await axios.get<Record<string, Omit<Member, "id">>>(`${BASE_URL}.json`);
    const data = res.data;
    if (!data) return [];
    return Object.entries(data).map(([id, value]) => ({ id, ...value }));
  });
};

export const addMember = async (memberInput: CreateMemberInput): Promise<void> => {
  const member = { 
    ...memberInput, 
    joinedAt: memberInput.joinedAt || new Date().toISOString() 
  };
  await axios.post(`${BASE_URL}.json`, member);
  invalidateCache(CACHE_KEY);
};

export const updateMember = async (
  id: string,
  memberUpdate: Partial<CreateMemberInput>,
): Promise<void> => {
  await axios.patch(`${BASE_URL}/${id}.json`, memberUpdate);
  invalidateCache(CACHE_KEY);
};

export const deleteMember = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}.json`);
  invalidateCache(CACHE_KEY);
};

