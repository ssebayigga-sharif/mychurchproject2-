export type BaptismStatus = "Baptized" | "Not baptized" | "In preparation";

export type UserRole = "Admin" | "Leader" | "Member";

export type LeaderPosition =
  | "Elder"
  | "Deacon"
  | "Deaconess"
  | "Department Head"
  | "Pastor"
  | "Clerk"
  | "Treasurer";

//when creating member
export type MemberDepartment =
  | "Sabbath School"
  | "Children"
  | "Youth"
  | "Music"
  | "Deacons"
  | "Deaconesses"
  | "Health"
  | "Communication"
  | "Elders"
  | "Personal Ministries"
  | "Community Services";

//when creating a new member
export type CreateMemberInput = {
  firstName: string;
  lastName: string;
  phone: string;
  email?: string;
  department: MemberDepartment;
  baptismStatus: BaptismStatus;
  memberType?: "Member" | "Visitor";
  joinedAt?: string;
};

//for members returned from the database
export type Member = CreateMemberInput & {
  id: string;
  joinedAt: string;
};
//program
export type ProgramStatus = "Upcoming" | "Completed";
export type ProgramTypes =
  | "Youth Program"
  | "sabbath School"
  | "Church At Study"
  | "Prayer Requests"
  | "Evangelism"
  | "Special Event"
  | "Camp Meeting";

//to create a new program
export type CreateProgramInput = {
  title: string;
  date: string;
  speaker: string;
  theme: string;
  type: ProgramTypes;
  status: ProgramStatus;
};

//programms returned from the database

export type Program = CreateProgramInput & {
  id: string;
  createdAt: string;
};

//Attendance

export type AttendanceMap = Record<string, boolean>;

export type AttendanceRecord = {
  id?: number;
  programId: string;
  memberId: string;
  isPresent: boolean;
  markedAt: string;
};

//dashboard stats types

export type DashboardStats = {
  totalMembers: number;
  baptizedCount: number;
  nonBaptizedCount: number;
  visitorsCount: number;
  totalPrograms: number;
  upcomingPrograms: number;
  completedPrograms: number;
  recentPrograms: Program[];
  departmentBreakdown: { department: string; count: number }[];
  recentPrayers: PrayerRequest[];
  upcomingBirthdays: { profile: MemberProfile; memberName: string }[];
  totalPrayers: number;
  answeredPrayers: number;
  pendingPrayers: number;
  totalAttendance: number;
  averageAttendance: number;
};

//member profile information
export type Gender = "Male" | "Female";

export type MaritalStatus = "Married" | "Single" | "Widowed" | "Divorced";

export type EmergencyContact = {
  name: string;
  relationship: string;
  phone: string;
};

export type FamilyInfo = {
  maritalStatus: MaritalStatus;
  spouseName?: string;
  numberOfChildren?: number;
};

export type HomeChurchInfo = {
  currentChurch: string;
  formerChurch?: string;
  transferDate?: string;
  transferFromCity?: string;
};

export type HealthNotes = {
  dietaryNeeds: string;
  disabilities?: string;
  otherNotes?: string;
};

export type CreateMemberProfileInput = {
  memberId: string;

  dateOfBirth?: string;
  gender?: Gender;
  age?: number;

  phone: string;
  email?: string;
  address?: string;
  city?: string;
  country?: string;

  emergencyContact: EmergencyContact;
  familyInfo: FamilyInfo;
  homeChurchInfo: HomeChurchInfo;
  healthNotes: HealthNotes;
};

export type MemberProfile = CreateMemberProfileInput & {
  id: string;
  updatedAt: string;
};

export type PrayerCategory =
  | "Health"
  | "Family"
  | "Financial"
  | "Spiritual Growth"
  | "Bereavement"
  | "Thanks Giving"
  | "Other";

export type PrayerStatus = "Pending" | "Completed";

export type CreatePrayerRequestInput = {
  name: string;
  request: string;
  category: PrayerCategory;
  isPrivate: boolean;
  status: PrayerStatus;
  prayerCount: number;
  createdAt: string;
  completedAt?: string;
};

export type PrayerRequest = CreatePrayerRequestInput & {
  id: string;
};

export type AnnouncementCategory =
  | "General"
  | "Event"
  | "Finance"
  | "Youth"
  | "Health"
  | "Urgent";

export type AnnouncementPriority = "Low" | "Normal" | "High";

export type AnnouncementStatus = "Active" | "archived";

export type CreateAnnouncementInput = {
  title: string;
  body: string;
  category: AnnouncementCategory;
  priority: AnnouncementPriority;
  targetDepartment: MemberDepartment | null;
  expiresAt?: string;
  authorName: string;
  createdAt: string;
  status: AnnouncementStatus;
  readBy: string[];
};

export type Announcement = CreateAnnouncementInput & {
  id: string;
};

export type BroadcastChannel = "Email" | "SMS" | "Both";

export type BroadcastStatus = "Sent" | "Pending" | "Failed";

export type CreateBroadcastInput = {
  subject: string;
  message: string;
  channel: BroadcastChannel;
  targetDepartment: MemberDepartment | null;
  sentAt: string;
  sentBy: string;
  recipientCount: number;
  status: BroadcastStatus;
};

export type Broadcast = CreateBroadcastInput & {
  id: string;
};

//internal messsages

export type MessageThread = {
  id: string;
  participants: string[];
  subject: string;
  createdAt: string;
  lastMessageAt: string;
  unreadCount: number;
};

export type InternalMessage = {
  id: string;
  threadId: string;
  senderName: string;
  body: string;
  sentAt: string;
  readBy: string[];
};

export type CreateMessageInput = {
  threadId: string;
  senderName: string;
  body: string;
  sentAt: string;
  readBy: string[];
};

export type Leader = {
  id: string;
  memberId: string;
  name: string;
  position: LeaderPosition;
  department?: MemberDepartment;
  termStart: string;
  termEnd?: string;
  isActive: boolean;
};

export type CreateLeaderInput = Omit<Leader, "id">;

export type User = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
};

export type userProfileUpdates = Pick<User, "name" | "phone" | "address">;

export type authStatus =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "authenticated"; user: User }
  | { status: "unauthenticated" };

export type authError = {
  code:
    | "Invalid-Credentials"
    | "network-error"
    | "session-corrupted"
    | "unknown";
  message: string;
};

export type CarbonTheme = "white" | "g10" | "g90" | "g100";

export interface ThemeContextValue {
  isTheme: CarbonTheme;
  isDark: boolean;
  toggleTheme: () => void;
  setIsTheme: (theme: CarbonTheme) => void;
}