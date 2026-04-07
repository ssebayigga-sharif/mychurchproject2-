import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import Footer from "./Footer";
import styles from "./Layout.module.scss";

const Layout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Overlay — closes sidebar when tapping outside on mobile */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={styles.main}>
        <div className={styles.header}>
          <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        </div>
        <div className={styles.content}>
          <Outlet />
        </div>
        <Footer />
      </div>
    </div>
  );
};

export default Layout;
