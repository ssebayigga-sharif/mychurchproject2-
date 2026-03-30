import axios from "axios";
import type {
  MemberProfile,
  CreateMemberProfileInput,
} from "../types/church.types";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/profiles";

// Get a single profile by memberId
export const getProfileByMemberId = async (
  memberId: string,
): Promise<MemberProfile | null> => {
  const res = await axios.get<Record<string, Omit<MemberProfile, "id">> | null>(
    `${BASE_URL}.json?orderBy="memberId"&equalTo="${memberId}"`,
  );

  const data = res.data;
  if (!data) return null;

  const entries = Object.entries(data);
  if (entries.length === 0) return null;

  const [id, value] = entries[0];
  return { id, ...value };
};

// Get all profiles
export const getAllProfiles = async (): Promise<MemberProfile[]> => {
  const res = await axios.get<Record<string, Omit<MemberProfile, "id">> | null>(
    `${BASE_URL}.json`,
  );

  const data = res.data;
  if (!data) return [];

  return Object.entries(data).map(([id, value]) => ({ id, ...value }));
};

// Create a new profile
export const createProfile = async (
  profile: CreateMemberProfileInput,
): Promise<void> => {
  await axios.post(`${BASE_URL}.json`, {
    ...profile,
    updatedAt: new Date().toISOString(),
  });
};

// Update an existing profile
export const updateProfile = async (
  id: string,
  profile: Partial<CreateMemberProfileInput>,
): Promise<void> => {
  await axios.patch(`${BASE_URL}/${id}.json`, {
    ...profile,
    updatedAt: new Date().toISOString(),
  });
};

// Delete a profile
export const deleteProfile = async (id: string): Promise<void> => {
  await axios.delete(`${BASE_URL}/${id}.json`);
};
