import axios from "axios";
import type { Program } from "../types/Program";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/programs";

export const getPrograms = async (): Promise<Program[]> => {
  const res = await axios.get(`${BASE_URL}.json`);
  const data = res.data;

  return data
    ? Object.entries(data).map(([id, values]: any) => ({
        id,
        ...(values as Program),
      }))
    : [];
};

export const addProgram = async (program: Program) => {
  await axios.post(`${BASE_URL}.json`, program);
};

export const updateProgram = async (id: string, program: Partial<Program>) => {
  await axios.patch(`${BASE_URL}/${id}.json`, program);
};

export const deleteProgram = async (id: string) => {
  await axios.delete(`${BASE_URL}/${id}.json`);
};
