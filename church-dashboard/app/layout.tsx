import type { Metadata } from "next";
import "@carbon/styles/css/styles.css";
import "@carbon/charts/styles.css";
import "./globals.scss";
import "../styles/styles/carbon-theme.scss";
import AppProviders from "../components/common/AppProviders";

export const metadata: Metadata = {
  title: "Church Dashboard",
  description: "Church Management Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
