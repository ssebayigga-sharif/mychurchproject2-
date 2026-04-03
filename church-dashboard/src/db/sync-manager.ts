import axios from 'axios';
import { db, type SyncOperation } from './offline-db';

const FIREBASE_BASE_URL = 'https://my-church-9abc5-default-rtdb.firebaseio.com';

const ENTITY_URL_MAP: Record<string, string> = {
  members: `${FIREBASE_BASE_URL}/members`,
  prayers: `${FIREBASE_BASE_URL}/prayers`,
  programs: `${FIREBASE_BASE_URL}/programs`,
  announcements: `${FIREBASE_BASE_URL}/announcements`,
  broadcasts: `${FIREBASE_BASE_URL}/broadcasts`,
  attendance: `${FIREBASE_BASE_URL}/attendance`,
  profiles: `${FIREBASE_BASE_URL}/profiles`,
  messages: `${FIREBASE_BASE_URL}/messageThreads`, // Threads table
};

class SyncManager {
  private processing = false;

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.processQueue());
    }
  }

  async scheduleSync(operation: Omit<SyncOperation, 'timestamp'>) {
    await db.syncQueue.add({
      ...operation,
      timestamp: Date.now(),
    });

    if (navigator.onLine) {
      this.processQueue();
    }
  }

  async processQueue() {
    if (this.processing || !navigator.onLine) return;
    this.processing = true;

    try {
      const operations = await db.syncQueue.orderBy('timestamp').toArray();
      
      for (const op of operations) {
        try {
          const baseUrl = ENTITY_URL_MAP[op.entity];
          if (!baseUrl) {
            console.error(`No URL mapping for entity: ${op.entity}`);
            continue;
          }

          if (op.type === 'POST') {
            const response = await axios.post(`${baseUrl}.json`, op.data);
            const firebaseId = response.data.name;
            // Update local record with the real Firebase ID if it was a temporary ID
            if (op.data.id && op.data.id.startsWith('temp-')) {
               await (db[op.entity] as any).update(op.data.id, { id: firebaseId });
            }
          } else if (op.type === 'PATCH') {
            await axios.patch(`${baseUrl}/${op.idInEntity}.json`, op.data);
          } else if (op.type === 'DELETE') {
            await axios.delete(`${baseUrl}/${op.idInEntity}.json`);
          }

          // Operation successful, remove from queue
          await db.syncQueue.delete(op.id!);
        } catch (error) {
          console.error('Failed to sync operation:', op, error);
          // Stop processing queue if there's a network error (not a 4xx/5xx logical error)
          if (!axios.isAxiosError(error) || !error.response) {
             break; 
          }
          // If it's a 4xx error, maybe remove it from queue? For now, we keep it.
        }
      }
    } finally {
      this.processing = false;
    }
  }
}

export const syncManager = new SyncManager();
