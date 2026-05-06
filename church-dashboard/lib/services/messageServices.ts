import axios from "axios";
import type { MessageThread, InternalMessage, CreateMessageInput } from "../types/church.types";
import { cachedRequest, invalidateCache } from "./requestCache";

const BASE = "https://my-church-9abc5-default-rtdb.firebaseio.com/messages";
const THREADS_KEY = "messages:threads";
const messagesKey = (threadId: string) => `messages:thread:${threadId}`;

export const getThreads = async (): Promise<MessageThread[]> => {
  return cachedRequest(THREADS_KEY, async () => {
    const res = await axios.get<Record<string, Omit<MessageThread, "id">> | null>(`${BASE}/threads.json`);
    const data = res.data;
    if (!data) return [];

    return Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  });
};

export const getMessages = async (threadId: string): Promise<InternalMessage[]> => {
  return cachedRequest(messagesKey(threadId), async () => {
    const res = await axios.get<Record<string, Omit<InternalMessage, "id">> | null>(`${BASE}/threads/${threadId}/messages.json`);
    const data = res.data;
    if (!data) return [];

    return Object.entries(data)
      .map(([id, value]) => ({ id, ...value }))
      .sort((a, b) => new Date(a.sentAt).getTime() - new Date(b.sentAt).getTime());
  });
};

export const sendMessage = async (input: CreateMessageInput): Promise<void> => {
  const now = input.sentAt;
  await Promise.all([
    axios.post(`${BASE}/threads/${input.threadId}/messages.json`, input),
    axios.patch(`${BASE}/threads/${input.threadId}.json`, { lastMessageAt: now })
  ]);
  invalidateCache(THREADS_KEY);
  invalidateCache(messagesKey(input.threadId));
};

export const createThread = async (
  subject: string,
  participants: string[]
): Promise<string> => {
  const now = new Date().toISOString();
  const thread = {
    subject,
    participants,
    createdAt: now,
    lastMessageAt: now,
    unreadCount: 0,
  };

  const res = await axios.post(`${BASE}/threads.json`, thread);
  invalidateCache(THREADS_KEY);
  return res.data.name;
};

export const markThreadRead = async (threadId: string): Promise<void> => {
  await axios.patch(`${BASE}/threads/${threadId}.json`, { unreadCount: 0 });
  invalidateCache(THREADS_KEY);
};
