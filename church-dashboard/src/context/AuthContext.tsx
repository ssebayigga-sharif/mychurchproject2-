import { createContext, useContext, useState, useEffect } from "react";
import type { ReactNode } from "react";
import type { UserRole } from "../types/church.types";

type User = {
  email: string;
  name: string;
  role: UserRole;
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Check local session on mount
  useEffect(() => {
    const session = localStorage.getItem("church_auth_session");
    if (session) {
      setUser(JSON.parse(session));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, pass: string) => {
    // Simulated network delay for premium feel
    await new Promise((resolve) => setTimeout(resolve, 1200));

    // Hardcoded auth verification (for frontend closure)
    if (email === "admin@church.org" && pass === "admin123") {
      const authUser: User = { email, name: "Church Admin", role: "Admin" };
      setUser(authUser);
      localStorage.setItem("church_auth_session", JSON.stringify(authUser));
      return;
    }

    if (email === "leader@church.org" && pass === "leader123") {
      const authUser: User = { email, name: "Church Leader", role: "Leader" };
      setUser(authUser);
      localStorage.setItem("church_auth_session", JSON.stringify(authUser));
      return;
    }
    
    throw new Error("Invalid email or password");
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("church_auth_session");
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};
