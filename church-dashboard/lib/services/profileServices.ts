import axios from "axios";
import type {
  MemberProfile,
  CreateMemberProfileInput,
} from "../types/church.types";
import { cachedRequest, invalidateCache } from "./requestCache";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/profiles";
const CACHE_PREFIX = "profiles";

// Get a single profile by memberId
export const getProfileByMemberId = async (
  memberId: string,
): Promise<MemberProfile | null> => {
  return cachedRequest(`${CACHE_PREFIX}:member:${memberId}`, async () => {
    const res = await axios.get<Record<string, Omit<MemberProfile, "id">> | null>(
      `${BASE_URL}.json?orderBy="memberId"&equalTo="${memberId}"`,
    );
    const data = res.data;
    if (!data || Object.keys(data).length === 0) return null;
    const [id, value] = Object.entries(data)[0];
    return { id, ...value };
  });
};

// Get all profiles
export const getAllProfiles = async (): Promise<MemberProfile[]> => {
  return cachedRequest(`${CACHE_PREFIX}:all`, async () => {
    const res = await axios.get<Record<string, Omit<MemberProfile, "id">> | null>(
      `${BASE_URL}.json`,
    );
    const data = res.data;
    if (!data) return [];
    return Object.entries(data).map(([id, value]) => ({ id, ...value }));
  });
};

// Create a new profile
export const createProfile = async (
  profile: CreateMemberProfileInput,
): Promise<void> => {
  await axios.post(`${BASE_URL}.json`, profile);
  invalidateCache(CACHE_PREFIX);
};

// Update an existing profile
export const updateProfile = async (
  id: string,
  profile: Partial<CreateMemberProfileInput>,
): Promise<void> => {
  const update = {
    ...profile,
    updatedAt: new Date().toISOString(),
  };
  await axios.patch(`${BASE_URL}/${id}.json`, update);
  invalidateCache(CACHE_PREFIX);
};

// Delete a profile
export const deleteProfile = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}.json`);
  invalidateCache(CACHE_PREFIX);
};

