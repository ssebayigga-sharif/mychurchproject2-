import { useAuth } from "../../lib/context/AuthContext";
import type { UserRole } from "../../lib/types/church.types";
import {
  Dashboard,
  UserMultiple,
  Events,
  Checkmark,
  Chat,
  Trophy,
  Settings as SettingsIcon,
} from "@carbon/icons-react";

export type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
  children?: {
    to: string;
    label: string;
  }[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/dashboard",
    label: "Dashboard",
    icon: <Dashboard size={20} />,
  },
  {
    to: "/dashboard/members",
    label: "Members",
    icon: <UserMultiple size={20} />,
  },
  {
    to: "/dashboard/programs",
    label: "Programs",
    icon: <Events size={20} />,
  },
  {
    to: "/dashboard/attendance",
    label: "Attendance",
    icon: <Checkmark size={20} />,
  },
  {
    to: "/dashboard/prayer",
    label: "PrayerRequests",
    icon: <Chat size={20} />,
  },
  {
    to: "/dashboard/communication",
    label: "Communication",
    allowedRoles: ["Admin", "Leader"],
    icon: <Chat size={20} />,
  },
  {
    to: "/dashboard/leaders",
    label: "Leaders",
    allowedRoles: ["Admin", "Leader"],
    icon: <Trophy size={20} />,
  },
  {
    to: "/dashboard/settings",
    label: "Settings",
    icon: <SettingsIcon size={20} />,
  },
];

export const useNavItems = () => {
  const { user } = useAuth();
  if (!user) return [];
  return NAV_ITEMS.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user.role),
  );
};
