import axios from "axios";
import type { Program, CreateProgramInput } from "../types/church.types";
import { db } from "../db/offline-db";
import { syncManager } from "../db/sync-manager";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/programs";

export const getPrograms = async (): Promise<Program[]> => {
  // 1. Get from local DB first
  const localPrograms = await db.programs.toArray();
  
  // 2. Fetch from Firebase in background
  axios.get<Record<string, Omit<Program, "id">>>(`${BASE_URL}.json`)
    .then(async (res) => {
      const data = res.data;
      if (data) {
        const serverPrograms = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        const serverIds = new Set(serverPrograms.map(p => p.id));

        await db.transaction('rw', db.programs, async () => {
          await db.programs.bulkPut(serverPrograms);
          await db.programs
            .filter(p => !serverIds.has(p.id) && !p.id.startsWith('temp-'))
            .delete();
        });
      }
    }).catch(err => console.error("Failed to background fetch programs", err));

  return localPrograms;
};


export const addProgram = async (
  programInput: CreateProgramInput,
): Promise<void> => {
  const tempId = `temp-${Date.now()}`;
  const program: Program = { 
    ...programInput, 
    id: tempId,
    createdAt: new Date().toISOString()
  };
  
  // 1. Local update
  await db.programs.add(program);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    entity: 'programs',
    type: 'POST',
    data: program
  });
};

export const updateProgram = async (
  id: string,
  programUpdate: Partial<CreateProgramInput>,
): Promise<void> => {
  // 1. Local update
  await db.programs.update(id, programUpdate);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    idInEntity: id,
    entity: 'programs',
    type: 'PATCH',
    data: programUpdate
  });
};

export const deleteProgram = async (id: string): Promise<void> => {
  // 1. Local update
  await db.programs.delete(id);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    idInEntity: id,
    entity: 'programs',
    type: 'DELETE',
    data: null
  });
};

