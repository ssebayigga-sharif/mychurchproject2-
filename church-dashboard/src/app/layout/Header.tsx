import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Header,
  HeaderContainer,
  HeaderName,
  HeaderGlobalBar,
  HeaderGlobalAction,
  HeaderMenuButton,
  SkipToContent,
  Button,
  Layer,
} from "@carbon/react";
import { UserAvatar, Logout, Settings, Add } from "@carbon/icons-react";
import styles from "./Header.module.scss";
import { useAuth } from "../../context/AuthContext";

type HeaderProps = {
  onMenuClick: () => void;
};

const AppHeader = ({}: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleClick = () => setShowProfile(false);
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  if (!user) {
    return (
      <HeaderContainer
        render={({ isSideNavExpanded, onClickSideNavExpand }) => (
          <>
            <SkipToContent />
            <Header aria-label="Church Dashboard">
              <HeaderMenuButton
                aria-label="Open menu"
                onClick={onClickSideNavExpand}
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
      render={({ isSideNavExpanded, onClickSideNavExpand }) => (
        <>
          <SkipToContent />
          <Header aria-label="Church Dashboard">
            <HeaderMenuButton
              aria-label="Open menu"
              onClick={onClickSideNavExpand}
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
              <HeaderGlobalAction
                aria-label="Quick Add"
                onClick={() => navigate("/members")}
              >
                <Add size={20} />
              </HeaderGlobalAction>
              <div className={styles.profileContainer}>
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
