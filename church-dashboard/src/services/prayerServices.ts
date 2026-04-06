import axios from "axios";
import type {
  CreatePrayerRequestInput,
  PrayerRequest,
} from "../types/church.types";

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
  const res = await axios.get<Record<string, Omit<PrayerRequest, "id">> | null>(`${BASE_URL}.json`);
  const data = res.data;
  if (!data) return [];
  const serverPrayers = Object.entries(data).map(([id, value]) => ({ id, ...value }));
  return filterPrayers(serverPrayers);
};

export const addPrayerRequest = async (
  prayerInput: CreatePrayerRequestInput,
): Promise<void> => {
  await axios.post(`${BASE_URL}.json`, prayerInput);
};

export const completePrayerRequest = async (id: string): Promise<void> => {
  const completedAt = new Date().toISOString();
  const update = { status: "Completed" as const, completedAt };
  await axios.patch(`${BASE_URL}/${id}.json`, update);
};

export const incrementPrayerCount = async (
  id: string,
  currentCount: number,
): Promise<void> => {
  const update = { prayerCount: currentCount + 1 };
  await axios.patch(`${BASE_URL}/${id}.json`, update);
};

export const deletePrayerRequest = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}.json`);
};

