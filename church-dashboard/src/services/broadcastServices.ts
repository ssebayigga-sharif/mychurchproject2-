import axios from "axios";
import type { Broadcast, CreateBroadcastInput } from "../types/church.types";


const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/broadcasts";

// stores the broadcast record in firebase
// TODO * Stores the broadcast record in Firebase.
//  * TODO: trigger a Firebase Cloud Function here to actually
//  * dispatch via SendGrid (email) or Twilio (SMS).
export const sendBroadcasts = async (input: CreateBroadcastInput): Promise<void> => {
    await axios.post(`${BASE_URL}.json`, input);
}

export const getBroadcasts = async (): Promise<Broadcast[]> => {
    const res = await axios.get<Record<string, Omit<Broadcast, "id">> | null>(`${BASE_URL}.json`);

    const data = res.data;
    if (!data) return [];
    return Object.entries(data).map(
        ([id, value]) => ({ id, ...value })
    ).sort(
        (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime()
    );
}