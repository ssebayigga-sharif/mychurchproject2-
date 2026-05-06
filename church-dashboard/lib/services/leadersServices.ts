import axios from "axios";
import type { Leader, CreateLeaderInput } from "../types/church.types";
import { cachedRequest, invalidateCache } from "./requestCache";

const BASE_URL = "https://church-dashboard-65a45-default-rtdb.firebaseio.com/leaders";
const CACHE_KEY = "leaders";

export const getLeaders = async (): Promise<Leader[]> => {
  return cachedRequest(CACHE_KEY, async () => {
    const response = await axios.get(`${BASE_URL}.json`);
    if (!response.data) return [];

    return Object.entries(response.data).map(([id, data]) => ({
      id,
      ...(data as any),
    }));
  });
};

export const addLeader = async (leader: CreateLeaderInput): Promise<string> => {
  const res = await axios.post(`${BASE_URL}.json`, leader);
  invalidateCache(CACHE_KEY);
  return res.data.name;
};

export const updateLeader = async (id: string, leader: Partial<Leader>): Promise<void> => {
  await axios.patch(`${BASE_URL}/${id}.json`, leader);
  invalidateCache(CACHE_KEY);
};

export const removeLeader = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}.json`);
  invalidateCache(CACHE_KEY);
};
