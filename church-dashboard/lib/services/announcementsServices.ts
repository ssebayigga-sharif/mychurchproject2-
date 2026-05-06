import axios from "axios";
import type { Announcement, CreateAnnouncementInput } from "../types/church.types";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/announcements";
const THREE_DAYS_MS = 3 * 24 * 60 * 60 * 1000;

const filterAnnouncements = (data: Announcement[]) => {
    const now = new Date();
    return data.filter((announcement) => {
        if (announcement.status === "archived") return false;
        
        if (announcement.expiresAt) {
            const expiryDate = new Date(announcement.expiresAt);
            if (expiryDate.getTime() + THREE_DAYS_MS < now.getTime()) {
                return false;
            }
        }
        return true;
    }).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
};

export const getAnnouncements = async (): Promise<Announcement[]> => {
    const res = await axios.get<Record<string, Omit<Announcement, "id">> | null>(`${BASE_URL}.json`);
    const data = res.data;
    if (!data) return [];
    
    const serverItems = Object.entries(data).map(([id, value]) => ({ 
        id, 
        ...value,
        readBy: value.readBy || [] 
    }));
    
    return filterAnnouncements(serverItems);
}

export const addAnnouncement = async (input: CreateAnnouncementInput): Promise<void> => {
    await axios.post(`${BASE_URL}.json`, input);
}

export const markAnnouncementRead = async (id: string, currentReadBy: string[], memberName: string):
    Promise<void> => {
    if (currentReadBy.includes(memberName)) return;
    
    const update = { readBy: [...currentReadBy, memberName] };
    await axios.patch(`${BASE_URL}/${id}.json`, update);
}

export const archiveAnnouncement = async (id: string): Promise<void> => {
    const update = { status: "archived" as const };
    await axios.patch(`${BASE_URL}/${id}.json`, update);
}

export const deleteAnnouncement = async (id: string): Promise<void> => {
    await axios.delete(`${BASE_URL}/${id}.json`);
}