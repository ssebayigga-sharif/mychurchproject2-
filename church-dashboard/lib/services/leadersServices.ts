import axios from "axios";
import type { Leader, CreateLeaderInput } from "../types/church.types";

const BASE_URL = "https://church-dashboard-65a45-default-rtdb.firebaseio.com/leaders";

export const getLeaders = async (): Promise<Leader[]> => {
  const response = await axios.get(`${BASE_URL}.json`);
  if (!response.data) return [];
  
  return Object.entries(response.data).map(([id, data]) => ({
    id,
    ...(data as any),
  }));
};

export const addLeader = async (leader: CreateLeaderInput): Promise<string> => {
  const res = await axios.post(`${BASE_URL}.json`, leader);
  return res.data.name;
};

export const updateLeader = async (id: string, leader: Partial<Leader>): Promise<void> => {
  await axios.patch(`${BASE_URL}/${id}.json`, leader);
};

export const removeLeader = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}.json`);
};

