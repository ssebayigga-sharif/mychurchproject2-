import { useEffect, useCallback } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
} from "@carbon/react";
import { UserAvatar } from "@carbon/icons-react";
import styles from "./Sidebar.module.scss";
import { useNavItems } from "../Navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navItems = useNavItems();
  const location = useLocation();

  //  Close on Escape key — accessibility requirement
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) onClose();
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  //  Smarter active check — exact for root, startsWith for nested
  const isActiveRoute = (to: string) =>
    to === "/" ? location.pathname === "/" : location.pathname.startsWith(to);

  //  Wraps onClick — doesn't swallow Carbon's internal event
  const handleNavClick = () => {
    // Don't preventDefault — let Carbon + React Router handle it
    onClose();
  };
  return (
    <>
      {/*  Overlay — clicking outside closes sidebar on mobile */}
      {isOpen && (
        <div className={styles.overlay} onClick={onClose} aria-hidden="true" />
      )}

      <SideNav
        isRail={false}
        expanded={isOpen}
        className={`${styles.sidebar} ${isOpen ? styles.open : ""}`}
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
          {navItems.map(({ to, label, icon, children }) =>
            //  Supports nav items with sub-routes (e.g. Members > Add / List)
            children?.length ? (
              <SideNavMenu
                key={to}
                title={label}
                renderIcon={() => (
                  <span className={styles.navIcon}>{icon}</span>
                )}
                defaultExpanded={isActiveRoute(to)}
              >
                {children.map((child) => (
                  <SideNavMenuItem
                    key={child.to}
                    as={Link}
                    to={child.to}
                    isActive={isActiveRoute(child.to)}
                    onClick={handleNavClick}
                  >
                    {child.label}
                  </SideNavMenuItem>
                ))}
              </SideNavMenu>
            ) : (
              <SideNavLink
                key={to}
                as={Link}
                to={to} //  required for a11y
                isActive={isActiveRoute(to)}
                isSideNavExpanded={isOpen} //  Carbon needs this for label visibility
                renderIcon={() => (
                  <span className={styles.navIcon}>{icon}</span>
                )}
                onClick={handleNavClick}
                className={styles.navLink}
              >
                {label}
              </SideNavLink>
            ),
          )}

          {/*  Profile — no wrapping div, Carbon SideNavItems expects direct children */}
          <SideNavLink
            as={Link}
            to="/profile"
            isActive={isActiveRoute("/profile")}
            isSideNavExpanded={isOpen}
            renderIcon={() => (
              <span className={styles.navIcon}>
                <UserAvatar size={20} />
              </span>
            )}
            onClick={handleNavClick}
            className={`${styles.navLink} ${styles.mobileProfileLink}`}
          >
            Profile
          </SideNavLink>
        </SideNavItems>

        <div className={styles.sidebarFooter}>
          <p className={styles.footerText}>
            Seventh-day Adventist Church Uganda
          </p>
          <p className={styles.footerVersion}>v1.0.0</p>
        </div>
      </SideNav>
    </>
  );
};

export default Sidebar;
