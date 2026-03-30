import axios from "axios";
import type {
  CreatePrayerRequestInput,
  PrayerRequest,
} from "../types/church.types";
const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/prayers";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;
//
export const getPrayerRequest = async (): Promise<PrayerRequest[]> => {
  const res = await axios.get<Record<string, Omit<PrayerRequest, "id">> | null>(
    `${BASE_URL}.json`,
  );

  const data = res.data;
  if (!data) return [];

  const now = Date.now();
  return Object.entries(data)
    .map(([id, value]) => ({ id, ...value }))
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
//
export const addPrayerRequest = async (
  prayer: CreatePrayerRequestInput,
): Promise<void> => {
  await axios.post(`${BASE_URL}.json`, prayer);
};
//
export const completePrayerRequest = async (id: string): Promise<void> => {
  await axios.patch(`${BASE_URL}/${id}.json`, {
    status: "Completed",
    completedAt: new Date().toISOString(),
  });
};
//
export const incrementPrayerCount = async (
  id: string,
  currentCount: number,
): Promise<void> => {
  await axios.patch(`${BASE_URL}/${id}.json`, {
    prayerCount: currentCount + 1,
  });
};
//
export const deletePrayerRequest = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}.json`);
};
