import axios from "axios";
import type { Program, CreateProgramInput } from "../types/church.types";
import { cachedRequest, invalidateCache } from "./requestCache";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/programs";
const CACHE_KEY = "programs";

export const getPrograms = async (): Promise<Program[]> => {
  return cachedRequest(CACHE_KEY, async () => {
    const res = await axios.get<Record<string, Omit<Program, "id">>>(`${BASE_URL}.json`);
    const data = res.data;
    if (!data) return [];
    return Object.entries(data).map(([id, value]) => ({ id, ...value }));
  });
};

export const addProgram = async (
  programInput: CreateProgramInput,
): Promise<void> => {
  const program = { 
    ...programInput, 
    createdAt: new Date().toISOString()
  };
  await axios.post(`${BASE_URL}.json`, program);
  invalidateCache(CACHE_KEY);
};

export const updateProgram = async (
  id: string,
  programUpdate: Partial<CreateProgramInput>,
): Promise<void> => {
  await axios.patch(`${BASE_URL}/${id}.json`, programUpdate);
  invalidateCache(CACHE_KEY);
};

export const deleteProgram = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}.json`);
  invalidateCache(CACHE_KEY);
};

