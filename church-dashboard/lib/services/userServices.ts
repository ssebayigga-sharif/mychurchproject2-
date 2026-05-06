import axios from "axios";
import type { User } from "../types/church.types";
import { cachedRequest, invalidateCache } from "./requestCache";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/users";

const emailTokey = (email: string) => email.replace(/\./g, ",");
const cacheKey = (email: string) => `users:${emailTokey(email)}`;

export const getUserByEmail = async (email: string): Promise<User | null> => {
  const key = emailTokey(email);
  return cachedRequest(cacheKey(email), async () => {
    try {
      const response = await axios.get(`${BASE_URL}/${key}.json`);
      return response.data ?? null;
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        return null;
      }
      throw err;
    }
  });
};

export const updateUserFields = async (
  email: string,
  updates: Partial<Pick<User, "name" | "phone" | "address">>,
): Promise<void> => {
  const key = emailTokey(email);
  await axios.patch(`${BASE_URL}/${key}.json`, updates);
  invalidateCache(cacheKey(email));
};

export const createUser = async (user: User): Promise<void> => {
  const key = emailTokey(user.email);
  await axios.put(`${BASE_URL}/${key}.json`, user);
  invalidateCache(cacheKey(user.email));
};
