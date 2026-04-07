import axios from "axios";
import type { User } from "../types/church.types";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/users";

const emailTokey = (email: string) => email.replace(/\./g, ",");

export const getUserByEmail = async (email: string): Promise<User> => {
  const key = emailTokey(email);
  try {
    const response = await axios.get(`${BASE_URL}/${key}.json`);
    return response.data ?? null;
  } catch (err) {
    if (axios.isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
};

export const updateUserFields = async (
  email: string,
  updates: Partial<Pick<User, "name" | "phone" | "address">>,
): Promise<void> => {
  const key = emailTokey(email);
  await axios.patch(`${BASE_URL}/${key}.json`, updates);
};

export const createUser = async (user: User): Promise<void> => {
  const key = emailTokey(user.email);
  await axios.put(`${BASE_URL}/${key}.json`, user);
};
