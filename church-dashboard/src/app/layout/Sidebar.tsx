import { Link } from "react-router-dom";
import { SideNav, SideNavItems, SideNavLink } from "@carbon/react";
import styles from "./Sidebar.module.scss";
import { useNavItems } from "../Navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navItems = useNavItems();

  return (
    <SideNav
      isRail={false}
      expanded={isOpen}
      className={styles.sidebar}
      aria-label="Side navigation"
    >
      <div className={styles.brand}>
        <div className={styles.brandIcon}>K</div>
        <div className={styles.brandText}>
          <p className={styles.brandName}>Kabulengwa English</p>
          <p className={styles.brandSub}>SDA Church</p>
        </div>
      </div>

      <SideNavItems>
        {navItems.map(({ to, label, icon }) => (
          <Link key={to} to={to} className={styles.navLinkWrapper}>
            <SideNavLink
              renderIcon={() => <span className={styles.navIcon}>{icon}</span>}
              href="#"
              onClick={(e) => {
                e.preventDefault();
                onClose();
              }}
              className={styles.navLink}
            >
              {label}
            </SideNavLink>
          </Link>
        ))}
      </SideNavItems>

      <div className={styles.sidebarFooter}>
        <p className={styles.footerText}>Seventh-day Adventist Church Uganda</p>
        <p className={styles.footerVersion}>v1.0.0</p>
      </div>
    </SideNav>
  );
};

export default Sidebar;
