import axios from "axios";
import type { Broadcast, CreateBroadcastInput } from "../types/church.types";
import { cachedRequest, invalidateCache } from "./requestCache";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/broadcasts";
const CACHE_KEY = "broadcasts";

export const getBroadcasts = async (): Promise<Broadcast[]> => {
    return cachedRequest(CACHE_KEY, async () => {
        const res = await axios.get<Record<string, Omit<Broadcast, "id">> | null>(`${BASE_URL}.json`);
        const data = res.data;
        if (!data) return [];

        return Object.entries(data)
            .map(([id, value]) => ({ id, ...value }))
            .sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
    });
}

export const sendBroadcasts = async (input: CreateBroadcastInput): Promise<void> => {
    await axios.post(`${BASE_URL}.json`, input);
    invalidateCache(CACHE_KEY);
}
