import { NavLink } from "react-router-dom";
import styles from "./Sidebar.module.scss";
import { NAV_ITEMS } from "../Navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  return (
    <aside className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}>
      {/* Brand */}
      <div className={styles.brand}>
        <div className={styles.brandIcon}>K</div>
        <div>
          <p className={styles.brandName}>Kabulengwa English</p>
          <p className={styles.brandSub}>SDA Church</p>
        </div>
      </div>

      {/* Nav */}
      <nav className={styles.nav}>
        <p className={styles.navLabel}>Main menu</p>
        {NAV_ITEMS.map(({ to, label, icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === "/"}
            onClick={onClose}
            className={({ isActive }) =>
              `${styles.navLink} ${isActive ? styles.active : ""}`
            }
          >
            <span className={styles.navIcon}>{icon}</span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.sidebarFooter}>
        <p className={styles.footerText}>Seventh-day Adventist Church Uganda</p>
        <p className={styles.footerText} style={{ marginTop: 4, opacity: 0.5 }}>v1.0.0</p>
      </div>
    </aside>
  );
};

export default Sidebar;
