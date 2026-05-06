import Link from "next/link";
import { Grid, Column } from "@carbon/react";
import styles from "../../styles/modules/Footer.module.scss";
import { NAV_ITEMS } from "./Navigation";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <Grid fullWidth className={styles.footerGrid}>
        <Column lg={4} md={4} sm={4} className={styles.footerCol}>
          <div className={styles.brandSection}>
            <div className={styles.brandRow}>
              <div className={styles.brandIcon}>SDA</div>
              <div>
                <h4 className={styles.brandName}>
                  Kabulengwa English SDA Church
                </h4>
                <p className={styles.brandSub}>Seventh-day Adventist</p>
              </div>
            </div>
            <p className={styles.verse}>
              "Be strong and courageous. Do not be afraid; do not be
              discouraged, for the Lord your God will be with you wherever you
              go." -Joshua 1:9
            </p>
          </div>
        </Column>

        <Column lg={2} md={4} sm={4} className={styles.footerCol}>
          <h5 className={styles.colHeading}>Navigation</h5>
          <nav className={styles.linkGroup}>
            {NAV_ITEMS.slice(0, 4).map(({ to, label }) => (
              <Link key={to} href={to} className={styles.footerLink}>
                {label}
              </Link>
            ))}
          </nav>
        </Column>

        <Column lg={2} md={4} sm={4} className={styles.footerCol}>
          <h5 className={styles.colHeading}>Resources</h5>
          <nav className={styles.linkGroup}>
            <a href="#" className={styles.footerLink}>
              About Us
            </a>
            <a href="#" className={styles.footerLink}>
              Contact
            </a>
            <a href="#" className={styles.footerLink}>
              Privacy
            </a>
            <a href="#" className={styles.footerLink}>
              Terms
            </a>
          </nav>
        </Column>

        {/* <Column lg={4} md={8} sm={4} className={styles.footerCol}>
          <h5 className={styles.colHeading}>Service Times</h5>
          <div className={styles.serviceList}>
            <div className={styles.service}>
              <span className={styles.label}>Sabbath Service</span>
              <span className={styles.time}>9:00 AM</span>
            </div>
            <div className={styles.service}>
              <span className={styles.label}>Lunch Sabbath</span>
              <span className={styles.time}>1:30 PM</span>
            </div>
            <div className={styles.service}>
              <span className={styles.label}>Hymn Choices</span>
              <span className={styles.time}>4:00 PM</span>
            </div>
            <div className={styles.service}>
              <span className={styles.label}>Location</span>
              <span className={styles.time}>Kampala, Uganda</span>
            </div>
          </div>
        </Column> */}
      </Grid>

      <div className={styles.footerBottom}>
        <p className={styles.copyright}>
          Ã‚Â© {year} Kabulengwa English SDA Church. All rights reserved.
        </p>
        <div className={styles.footerBadges}>
          <span className={styles.badge}>Seventh-day Adventist Church</span>
          <span className={styles.badge}>v1.0.0</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
