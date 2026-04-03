import axios from "axios";
import type { Member, CreateMemberInput } from "../types/church.types";
import { db } from "../db/offline-db";
import { syncManager } from "../db/sync-manager";

const BASE_URL = "https://my-church-9abc5-default-rtdb.firebaseio.com/members";

export const getMembers = async (): Promise<Member[]> => {
  // 1. Get from local DB first
  const localMembers = await db.members.toArray();
  
  // 2. Fetch from Firebase in background to update local DB
  axios.get<Record<string, Omit<Member, "id">>>(`${BASE_URL}.json`)
    .then(async (res) => {
      const data = res.data;
      if (data) {
        const serverMembers = Object.entries(data).map(([id, value]) => ({ id, ...value }));
        const serverIds = new Set(serverMembers.map(m => m.id));

        // Use a transaction for stability
        await db.transaction('rw', db.members, async () => {
          // Upsert all server members
          await db.members.bulkPut(serverMembers);
          
          // Delete local members that are neither on server nor pending (temp-)
          await db.members
            .filter(m => !serverIds.has(m.id) && !m.id.startsWith('temp-'))
            .delete();
        });
      }
    }).catch(err => console.error("Failed to background fetch members", err));

  return localMembers;
};


export const addMember = async (memberInput: CreateMemberInput): Promise<void> => {
  const tempId = `temp-${Date.now()}`;
  const member: Member = { 
    ...memberInput, 
    id: tempId, 
    joinedAt: memberInput.joinedAt || new Date().toISOString() 
  };
  
  // 1. Update local DB immediately
  await db.members.add(member);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    entity: 'members',
    type: 'POST',
    data: member
  });
};

export const updateMember = async (
  id: string,
  memberUpdate: Partial<CreateMemberInput>,
): Promise<void> => {
  // 1. Update local DB immediately
  await db.members.update(id, memberUpdate);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    idInEntity: id,
    entity: 'members',
    type: 'PATCH',
    data: memberUpdate
  });
};

export const deleteMember = async (id: string): Promise<void> => {
  // 1. Update local DB immediately
  await db.members.delete(id);
  
  // 2. Schedule sync
  await syncManager.scheduleSync({
    idInEntity: id,
    entity: 'members',
    type: 'DELETE',
    data: null
  });
};

