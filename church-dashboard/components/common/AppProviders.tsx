"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "../../lib/context/AuthContext";
import { ThemeProvider } from "../../lib/context/ThemeContext";

export default function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ThemeProvider>{children}</ThemeProvider>
    </AuthProvider>
  );
}
