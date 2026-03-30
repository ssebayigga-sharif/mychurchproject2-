import axios from "axios";
import type { Announcement, CreateAnnouncementInput } from "../types/church.types";
//url to the announcements in the database
const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/announcements";
//fetches the announcement from the database
export const getAnnouncements = async (): Promise<Announcement[]> => {
    const res = await axios.get<Record<string, Omit<Announcement, "id">> | null>(`${BASE_URL}.json`);
    const data = res.data;
    if (!data) return [];
    const now = new Date();
    const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

    return Object.entries(data).map(([id, value]) => ({ 
        id, 
        ...value,
        readBy: value.readBy || [] // Defensive check
    })).filter(
        (announcement) => {
            if (announcement.status === "archived") return false;
            
            if (announcement.expiresAt) {
                const expiryDate = new Date(announcement.expiresAt);
                // Keep it if it hasn't expired yet OR if it's within 3 days of expiring
                if (expiryDate.getTime() + THREE_DAYS_MS < now.getTime()) {
                    return false;
                }
            }
            return true;
        }
    ).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
//adds an annnouncement to the database
export const addAnnouncement = async (input: CreateAnnouncementInput): Promise<void> => {
    await axios.post(`${BASE_URL}.json`,input)
}
//marks the announcement read
export const markAnnouncementRead = async (id: string, currentReadBy: string[], memberName: string):
    Promise<void> => {
    if (currentReadBy.includes(memberName)) return;
    await axios.patch(`${BASE_URL}/${id}.json`, {
        readBy:[...currentReadBy,memberName],
    })
}
//archives the announcement directly from the database
export const archiveAnnouncement = async (id: string): Promise<void> => {
    await axios.patch(`${BASE_URL}/${id}.json`, { status: "archived" });
}
//deletes the announcement directly from the database
export const deleteAnnouncement = async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}.json`)
}