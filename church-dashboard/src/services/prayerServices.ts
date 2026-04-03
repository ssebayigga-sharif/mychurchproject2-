import axios from "axios";
import type {
  CreatePrayerRequestInput,
  PrayerRequest,
} from "../types/church.types";
import { db } from "../db/offline-db";
import { syncManager } from "../db/sync-manager";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/prayers";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const filterPrayers = (data: PrayerRequest[]) => {
  const now = Date.now();
  return data
    .filter((p) => {
      if (p.status === "Pending") return true;
      if (!p.completedAt) return false;
      return now - new Date(p.completedAt).getTime() < THREE_DAYS_MS;
    })
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
};

export const getPrayerRequest = async (): Promise<PrayerRequest[]> => {
  // 1. Get from local DB first
  const localPrayers = await db.prayers.toArray();
  
  // 2. Fetch from Firebase in background
  axios.get<Record<string, Omit<PrayerRequest, "id">> | null>(`${BASE_URL}.json`)
    .then(async (res) => {
      const data = res.data;
      if (data) {
        const serverPrayers = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        const serverIds = new Set(serverPrayers.map(p => p.id));

        await db.transaction('rw', db.prayers, async () => {
          await db.prayers.bulkPut(serverPrayers);
          await db.prayers
            .filter(p => !serverIds.has(p.id) && !p.id.startsWith('temp-'))
            .delete();
        });
      }
    }).catch(err => console.error("Failed to background fetch prayers", err));

  return filterPrayers(localPrayers);
};


export const addPrayerRequest = async (
  prayerInput: CreatePrayerRequestInput,
): Promise<void> => {
  const tempId = `temp-${Date.now()}`;
  const prayer: PrayerRequest = { ...prayerInput, id: tempId };
  
  // 1. Local update
  await db.prayers.add(prayer);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    entity: 'prayers',
    type: 'POST',
    data: prayer
  });
};

export const completePrayerRequest = async (id: string): Promise<void> => {
  const completedAt = new Date().toISOString();
  const update = { status: "Completed" as const, completedAt };
  
  // 1. Local update
  await db.prayers.update(id, update);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    idInEntity: id,
    entity: 'prayers',
    type: 'PATCH',
    data: update
  });
};

export const incrementPrayerCount = async (
  id: string,
  currentCount: number,
): Promise<void> => {
  const update = { prayerCount: currentCount + 1 };
  
  // 1. Local update
  await db.prayers.update(id, update);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    idInEntity: id,
    entity: 'prayers',
    type: 'PATCH',
    data: update
  });
};

export const deletePrayerRequest = async (id: string): Promise<void> => {
  // 1. Local update
  await db.prayers.delete(id);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    idInEntity: id,
    entity: 'prayers',
    type: 'DELETE',
    data: null
  });
};

