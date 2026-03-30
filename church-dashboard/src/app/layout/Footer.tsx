import { NavLink } from "react-router-dom";
import styles from "./Footer.module.scss";
import { NAV_ITEMS } from "../Navigation";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.top}>
        {/* Brand & verse */}
        <div className={styles.brandCol}>
          <div className={styles.brandRow}>
            <div className={styles.brandIcon}>K</div>
            <div>
              <p className={styles.brandName}>Kabulengwa English SDA Church</p>
              <p className={styles.brandSub}>Seventh-day Adventist Church</p>
            </div>
          </div>
          <p className={styles.verse}>
            "Be strong and courageous. Do not be afraid; do not be discouraged,
            for the Lord your God will be with you wherever you go." -Joshua 1:9
          </p>
        </div>

        {/* Navigation */}
        <div className={styles.col}>
          <h4 className={styles.colHeading}>Navigation</h4>
          {NAV_ITEMS.map(({ to, label }) => (
            <NavLink key={to} to={to} className={styles.link}>
              {label}
            </NavLink>
          ))}
        </div>

        {/* Contact */}
        <div className={styles.col}>
          <h4 className={styles.colHeading}>Contact</h4>
          <p className={styles.info}>Uganda-Kampala-Kabulengwa</p>
          <p className={styles.info}>Sabbath Service: 9:00 AM</p>
          <p className={styles.info}>Lunch Sabbath: 1:30 PM</p>
          <p className={styles.info}>Hymn Choices: 4:00 PM</p>
        </div>
      </div>

      <div className={styles.bottom}>
        <p className={styles.copyright}>
          © {year} Kabulengwa English SDA Church. All rights reserved.
        </p>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <span className={styles.sdaBadge}>Seventh-day Adventist Church</span>
          <span className={styles.sdaBadge}>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
