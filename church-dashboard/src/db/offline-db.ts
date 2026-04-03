import Dexie, { type Table } from 'dexie';
import type { 
  Member, 
  Program, 
  PrayerRequest,
  Announcement,
  Broadcast,
  AttendanceRecord,
  MemberProfile,
  InternalMessage
} from '../types/church.types';

export interface SyncOperation {
  id?: number;
  idInEntity?: string; // e.g. the memberId or prayerId
  entity: 'members' | 'prayers' | 'programs' | 'announcements' | 'broadcasts' | 'attendance' | 'profiles' | 'messages';
  type: 'POST' | 'PATCH' | 'DELETE';
  data: any;
  timestamp: number;
}

export class ChurchDatabase extends Dexie {
  members!: Table<Member>;
  programs!: Table<Program>;
  prayers!: Table<PrayerRequest>;
  announcements!: Table<Announcement>;
  broadcasts!: Table<Broadcast>;
  attendance!: Table<AttendanceRecord>;
  profiles!: Table<MemberProfile>;
  messages!: Table<InternalMessage>;
  syncQueue!: Table<SyncOperation>;

  constructor() {
    super('ChurchOfflineDB');
    this.version(1).stores({
      members: 'id, firstName, lastName, phone, email, memberType',
      programs: 'id, title, date, type, status',
      prayers: 'id, name, status, category, createdAt',
      announcements: 'id, title, category, priority, status',
      broadcasts: 'id, subject, channel, status',
      attendance: '++id, programId, memberId',
      profiles: 'id, memberId',
      messages: 'id, threadId, senderName',
      syncQueue: '++id, entity, timestamp'
    });
  }
}

export const db = new ChurchDatabase();
