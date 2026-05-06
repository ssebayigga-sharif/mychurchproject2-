"use client";

import { useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import {
  SideNav,
  SideNavItems,
  SideNavLink,
  SideNavMenu,
  SideNavMenuItem,
} from "@carbon/react";
import { UserAvatar } from "@carbon/icons-react";
import styles from "../../styles/modules/Sidebar.module.scss";
import { useNavItems } from "./Navigation";

type SidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
  const navItems = useNavItems();
  const pathname = usePathname();

  //  Close on Escape key Ã¢â‚¬â€ accessibility requirement
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

  //  Smarter active check Ã¢â‚¬â€ exact for root, startsWith for nested
  const isActiveRoute = (to: string) =>
    to === "/dashboard" ? pathname === to : pathname.startsWith(to);

  //  Wraps onClick Ã¢â‚¬â€ doesn't swallow Carbon's internal event
  const handleNavClick = () => {
    onClose();
  };
  return (
    <>
      {/*  Overlay Ã¢â‚¬â€ clicking outside closes sidebar on mobile */}
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
                    href={child.to}
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
                href={to}
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

          {/*  Profile Ã¢â‚¬â€ no wrapping div, Carbon SideNavItems expects direct children */}
          <SideNavLink
            href="/dashboard/profile"
            isActive={isActiveRoute("/dashboard/profile")}
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
