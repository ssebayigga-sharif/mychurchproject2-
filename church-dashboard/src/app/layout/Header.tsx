import { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import styles from "./Header.module.scss";
import { NAV_ITEMS } from "../Navigation";
import { useAuth } from "../../context/AuthContext";

// ─── Types ────────────────────────────────────────────────────────────────────

type HeaderProps = {
  onMenuClick: () => void;
};

// ─── Component ────────────────────────────────────────────────────────────────

const Header = ({ onMenuClick }: HeaderProps) => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [showQuickAdd, setShowQuickAdd] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate("/login");
  };

  // Close menus when clicking anywhere else
  useEffect(() => {
    const handleClick = () => {
      setShowQuickAdd(false);
      setShowProfile(false);
    };
    document.addEventListener("click", handleClick);
    return () => document.removeEventListener("click", handleClick);
  }, []);

  return (
    <header className={styles.header}>
      {/* Hamburger — mobile only */}
      <button
        className={styles.menuBtn}
        onClick={onMenuClick}
        aria-label="Toggle navigation menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <line x1="3" y1="6" x2="21" y2="6" />
          <line x1="3" y1="12" x2="21" y2="12" />
          <line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>

      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>K</div>
        <span className={styles.brandName}>Kabulengwa English SDA Church</span>
      </div>

      <div className={styles.divider} />

      {/* Desktop nav — hidden on mobile */}
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ""}`}
          >
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Right side Actions */}
      <div className={styles.right} onClick={(e) => e.stopPropagation()}>
        
        {!user ? (
          <button className={styles.btnQuickAdd} onClick={() => navigate("/login")}>
            Sign In
          </button>
        ) : (
          <>
            {/* Quick Add Menu */}
            <div className={styles.dropdownContainer}>
              <button 
                className={styles.btnQuickAdd} 
                onClick={() => { setShowQuickAdd(!showQuickAdd); setShowProfile(false); }}
              >
                <span>+ Create</span>
              </button>
              
              {showQuickAdd && (
                <div className={styles.dropdownMenu}>
                  <button className={styles.dropdownItem} onClick={() => { navigate("/members"); setShowQuickAdd(false); }}>
                    <span className={styles.icon}>👤</span> Add Member
                  </button>
                  <button className={styles.dropdownItem} onClick={() => { navigate("/programs"); setShowQuickAdd(false); }}>
                    <span className={styles.icon}>📅</span> Schedule Program
                  </button>
                  <button className={styles.dropdownItem} onClick={() => { navigate("/prayer"); setShowQuickAdd(false); }}>
                    <span className={styles.icon}>🙏</span> Log Prayer Request
                  </button>
                </div>
              )}
            </div>

            {/* Profile Menu */}
            <div className={styles.dropdownContainer}>
              <div 
                className={styles.avatar} 
                onClick={() => { setShowProfile(!showProfile); setShowQuickAdd(false); }}
              >
                KM
              </div>
              
              {showProfile && (
                <div className={`${styles.dropdownMenu} ${styles.dropdownProfile}`}>
                  <div className={styles.profileHeader}>
                    <div className={styles.profileName}>{user?.name || "Kabulengwa Admin"}</div>
                    <div className={styles.profileEmail}>{user?.email || "admin@kabulengwasda.org"}</div>
                  </div>
                  <div className={styles.menuDivider} />
                  
                  <button className={styles.dropdownItem} onClick={() => { setShowProfile(false); }}>
                    <span className={styles.icon}>⚙️</span> Settings
                  </button>
                  <button className={styles.dropdownItem} onClick={() => { setShowProfile(false); }}>
                    <span className={styles.icon}>🌙</span> Dark Mode 
                    <span className={styles.badgeSoon}>Soon</span>
                  </button>
                  
                  <div className={styles.menuDivider} />
                  
                  <button className={`${styles.dropdownItem} ${styles.dangerText}`} onClick={handleSignOut}>
                    <span className={styles.icon}>🚪</span> Sign Out
                  </button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;
