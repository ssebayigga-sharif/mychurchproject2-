"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  Button,
  Layer
} from "@carbon/react";
import { UserAvatar, Logout, Settings } from "@carbon/icons-react";
import styles from "../../styles/modules/Header.module.scss";
import { useAuth } from "../../lib/context/AuthContext";

type HeaderProps = {
  onMenuClick: () => void;
};

const navItems = [
  { label: "Dashboard", path: "/dashboard" },
  { label: "Members", path: "/dashboard/members" },
  { label: "Programs", path: "/dashboard/programs" },
  { label: "Prayer Requests", path: "/dashboard/prayer" },
  { label: "Attendance", path: "/dashboard/attendance" },
];

const AppHeader = ({ onMenuClick }: HeaderProps) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = () => {
    logout();
    router.push("/login");
  };

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const profileContainer = document.querySelector(
        `.${styles.profileContainer}`,
      );
      if (profileContainer && !profileContainer.contains(e.target as Node)) {
        setShowProfile(false);
      }
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!user) {
    return (
      <HeaderContainer
        render={({ isSideNavExpanded }) => (
          <>
            <Header aria-label="Church Dashboard">
              <HeaderMenuButton
                aria-label="Open menu"
                onClick={onMenuClick}
                isActive={isSideNavExpanded}
              />
              <HeaderName
                prefix=""
                className={styles.headerBrand}
                onClick={() => router.push("/dashboard")}
              >
                Kabulengwa English SDA Church
              </HeaderName>
              <HeaderGlobalBar className={styles.headerRight}>
                <Button
                  kind="ghost"
                  size="lg"
                  onClick={() => router.push("/login")}
                  className={styles.signInBtn}
                >
                  Sign In
                </Button>
              </HeaderGlobalBar>
            </Header>
          </>
        )}
      />
    );
  }

  return (
    <HeaderContainer
      render={({ isSideNavExpanded }) => (
        <>
          <Header aria-label="Church Dashboard">
            <HeaderMenuButton
              aria-label="Open menu"
              onClick={onMenuClick}
              isActive={isSideNavExpanded}
            />
            <HeaderName
              prefix=""
              className={styles.headerBrand}
              onClick={() => router.push("/dashboard")}
            >
              Kabulengwa English SDA Church
            </HeaderName>
            <HeaderGlobalBar className={styles.headerRight}>
              <div className={styles.navLinks}>
                {navItems.map((item) => (
                  <Link
                    key={item.path}
                    href={item.path}
                    className={
                      pathname === item.path || pathname.startsWith(`${item.path}/`)
                        ? `${styles.navLink} ${styles.activeNavLink}`
                        : styles.navLink
                    }
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              <div
                className={styles.profileContainer}
                onClick={(e) => e.stopPropagation()}
              >
                <HeaderGlobalAction
                  aria-label="User Profile"
                  onClick={() => {
                    setShowProfile(!showProfile);
                  }}
                >
                  <UserAvatar size={20} />
                </HeaderGlobalAction>
                {showProfile && (
                  <Layer className={styles.profileMenu}>
                    <div className={styles.profileHeader}>
                      <div className={styles.profileName}>
                        {user?.name || "Admin"}
                      </div>
                      <div className={styles.profileEmail}>
                        {user?.email || "admin@example.com"}
                      </div>
                    </div>
                    <div className={styles.menuDivider} />
                    <button
                      className={styles.menuItem}
                      onClick={() => {
                        setShowProfile(false);
                        router.push("/dashboard/profile");
                      }}
                    >
                      <UserAvatar size={16} /> Profile
                    </button>
                    <div className={styles.menuDivider} />
                    <button
                      className={styles.menuItem}
                      onClick={() => {
                        setShowProfile(false);
                        router.push("/dashboard/settings");
                      }}
                    >
                      <Settings size={16} /> Settings
                    </button>
                    <div className={styles.menuDivider} />
                    <button
                      className={`${styles.menuItem} ${styles.dangerItem}`}
                      onClick={handleSignOut}
                    >
                      <Logout size={16} /> Sign Out
                    </button>
                  </Layer>
                )}
              </div>
            </HeaderGlobalBar>
          </Header>
        </>
      )}
    />
  );
};

export default AppHeader;
