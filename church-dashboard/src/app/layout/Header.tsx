import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  Button,
  Layer,
} from "@carbon/react";
import { UserAvatar, Logout, Settings } from "@carbon/icons-react";
import styles from "./Header.module.scss";
import { useAuth } from "../../context/AuthContext";

type HeaderProps = {
  onMenuClick: () => void;
};

const navItems = [
  { label: "Members", path: "/members" },
  { label: "Programs", path: "/programs" },
  { label: "Prayer Requests", path: "/prayer" },
  { label: "Attendance", path: "/attendance" },
];

const AppHeader = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/login");
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
                onClick={() => navigate("/")}
              >
                Kabulengwa English SDA Church
              </HeaderName>
              <HeaderGlobalBar className={styles.headerRight}>
                <Button
                  kind="ghost"
                  size="lg"
                  onClick={() => navigate("/login")}
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
            {/* <HeaderName
              prefix=""
              className={styles.headerBrand}
              onClick={() => navigate("/")}
            >
              Kabulengwa English SDA Church
            </HeaderName> */}
            <HeaderGlobalBar className={styles.headerRight}>
              <div className={styles.navLinks}>
                {navItems.map((item) => (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={({ isActive }) =>
                      isActive
                        ? `${styles.navLink} ${styles.activeNavLink}`
                        : styles.navLink
                    }
                  >
                    {item.label}
                  </NavLink>
                ))}
              </div>
              {/* <HeaderGlobalAction
                aria-label="Quick Add"
                onClick={() => navigate("/members")}
              >
                <Add size={20} />
              </HeaderGlobalAction> */}
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
                        navigate("/profile");
                      }}
                    >
                      <UserAvatar size={16} /> Profile
                    </button>
                    <div className={styles.menuDivider} />
                    <button
                      className={styles.menuItem}
                      onClick={() => {
                        setShowProfile(false);
                        navigate("/settings");
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
