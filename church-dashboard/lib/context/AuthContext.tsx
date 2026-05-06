"use client";

import {
  useCallback,
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from "react";
import type { ReactNode } from "react";
import type { authError, User } from "../types/church.types";
import {
  createUser,
  getUserByEmail,
  updateUserFields,
} from "../services/userServices";

// ─── Hardcoded credentials (dev-only seed) ────────────────────────────────────
// These only exist to bootstrap Firebase — once users exist in the DB,
// remove this entirely and use Firebase Authentication SDK
const DEV_CREDENTIALS: Record<
  string,
  { pass: string; role: User["role"]; name: string }
> = {
  "admin@church.org": { pass: "admin123", role: "Admin", name: "Church Admin" },
  "leader@church.org": {
    pass: "leader123",
    role: "Leader",
    name: "Church Leader",
  },
};

const SESSION_KEY = "church_auth_session";

function readSession(): User | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      "id" in parsed &&
      "email" in parsed &&
      "name" in parsed
    ) {
      return parsed as User;
    }
    return null;
  } catch {
    localStorage.removeItem(SESSION_KEY);
    return null;
  }
}
function writeSession(user: User): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

type AuthContextType = {
  user: User | null;
  loading: boolean;
  lastError: authError | null;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
  // Kept as updateUser — matches your UserProfile page exactly
  updateUser: (updates: Partial<User>) => Promise<void>;
  clearError: () => void;
};

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastError, setLastError] = useState<authError | null>(null);

  // Check local session on mount
  useEffect(() => {
    const session = readSession();
    setUser(session);
    setLoading(false);
  }, []);

  const login = useCallback(
    async (email: string, pass: string): Promise<void> => {
      setLoading(true);
      setLastError(null);
      console.log({ email, pass });

      try {
        const cred = DEV_CREDENTIALS[email];
        if (!cred || cred.pass !== pass) {
          throw Object.assign(new Error("Invalid email or password"), {
            code: "invalid-credentials",
          });
        }
        let firebaseUser = await getUserByEmail(email);
        console.log("Firebase user:", firebaseUser);
        if (!firebaseUser) {
          const newUser: User = {
            id: email.replace(/\./g, ","),
            email,
            name: cred.name,
            role: cred.role,
          };
          await createUser(newUser);
          firebaseUser = newUser;
        }
        writeSession(firebaseUser);
        setUser(firebaseUser);
      } catch (err) {
        clearSession();
        setUser(null);

        const authErrorOccured: authError =
          err instanceof Error && "code" in err
            ? {
                code: (err as Error & { code: authError["code"] }).code,
                message: err.message,
              }
            : {
                code: "network-error",
                message: "An unexpected error occurred",
              };

        setLastError(authErrorOccured);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const updateUser = useCallback(
    async (updates: Partial<User>): Promise<void> => {
      if (!user) return;

      // Optimistic update — UI responds immediately
      const updatedUser: User = { ...user, ...updates };
      setUser(updatedUser);
      writeSession(updatedUser);

      try {
        // Only send fields the user is allowed to change
        const { name, phone, address } = updates;
        await updateUserFields(user.email, {
          ...(name !== undefined && { name }),
          ...(phone !== undefined && { phone }),
          ...(address !== undefined && { address }),
        });
      } catch {
        // Rollback on Firebase failure
        setUser(user);
        writeSession(user);
        setLastError({
          code: "network-error",
          message: "Failed to save profile. Changes reverted.",
        });
      }
    },
    [user],
  );
  const logout = () => {
    setUser(null);
    localStorage.removeItem(SESSION_KEY);
  };
  const clearError = useCallback(() => setLastError(null), []);

  const value = useMemo<AuthContextType>(
    () => ({ user, loading, lastError, login, logout, updateUser, clearError }),
    [user, loading, lastError, login, logout, updateUser, clearError],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Custom hook for consuming the auth context

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

// Granular selectors — import these in components that only need one thing
// Avoids re-rendering a component just because loading changed
export const useAuthUser = () => useAuth().user;
export const useIsAuthenticated = () => useAuth().user !== null;
