import { useAuth } from "../context/AuthContext";
import type { UserRole } from "../types/church.types";
import {
  Dashboard,
  UserMultiple,
  Events,
  Checkmark,
  Chat,
  Trophy,
} from "@carbon/icons-react";

export type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
};

export const NAV_ITEMS: NavItem[] = [
  {
    to: "/",
    label: "Dashboard",
    icon: <Dashboard size={20} />,
  },
  {
    to: "/members",
    label: "Members",
    icon: <UserMultiple size={20} />,
  },
  {
    to: "/programs",
    label: "Programs",
    icon: <Events size={20} />,
  },
  {
    to: "/attendance",
    label: "Attendance",
    icon: <Checkmark size={20} />,
  },
  {
    to: "/prayer",
    label: "PrayerRequests",
    icon: <Chat size={20} />,
  },
  {
    to: "/communication",
    label: "Communication",
    allowedRoles: ["Admin", "Leader"],
    icon: <Chat size={20} />,
  },
  {
    to: "/leaders",
    label: "Leaders",
    allowedRoles: ["Admin", "Leader"],
    icon: <Trophy size={20} />,
  },
];

export const useNavItems = () => {
  const { user } = useAuth();
  if (!user) return [];
  return NAV_ITEMS.filter(
    (item) => !item.allowedRoles || item.allowedRoles.includes(user.role),
  );
};
