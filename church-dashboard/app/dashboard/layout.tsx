"use client";

import { useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Header from "../../components/layout/Header";
import Footer from "../../components/layout/Footer";
import styles from "../../styles/modules/Layout.module.scss";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className={styles.layout}>
      {/* Overlay â€” closes sidebar when tapping outside on mobile */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <div className={styles.header}>
        <Header onMenuClick={() => setSidebarOpen((prev) => !prev)} />
      </div>

      <div className={styles.body}>
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        <main className={styles.main}>
          <div className={styles.content}>{children}</div>
          <Footer />
        </main>
      </div>
    </div>
  );
}
