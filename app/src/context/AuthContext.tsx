import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import axios from "axios";
import { registerUser, loginUser, fetchCurrentUser } from "@/services/authService";
import {
  UNAUTHORIZED_EVENT,
  clearAuth,
  getStoredToken,
  getStoredUser,
  storeAuth,
} from "@/lib/authStorage";
import type { AuthUser } from "@/types/auth";

interface AuthContextValue {
  user: AuthUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  // Start from what's stored so the navbar doesn't flash a signed-out state,
  // then confirm with the server below.
  const [user, setUser] = useState<AuthUser | null>(() => (getStoredToken() ? getStoredUser() : null));
  const [loading, setLoading] = useState<boolean>(() => !!getStoredToken());

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  // Verify the stored token once on startup.
  useEffect(() => {
    if (!getStoredToken()) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    fetchCurrentUser()
      .then((fresh) => {
        if (cancelled) return;
        setUser(fresh);
        storeAuth(getStoredToken()!, fresh);
      })
      .catch((err) => {
        if (cancelled) return;
        // Only an explicit 401 means the session is dead. If the server is
        // merely unreachable, keep the user signed in with what we have.
        if (axios.isAxiosError(err) && err.response?.status === 401) logout();
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [logout]);

  // Any later 401 (token expired mid-session) signs the user out everywhere.
  useEffect(() => {
    window.addEventListener(UNAUTHORIZED_EVENT, logout);
    return () => window.removeEventListener(UNAUTHORIZED_EVENT, logout);
  }, [logout]);

  async function register(name: string, email: string, password: string) {
    const { token, user: authUser } = await registerUser(name, email, password);
    storeAuth(token, authUser);
    setUser(authUser);
  }

  async function login(email: string, password: string) {
    const { token, user: authUser } = await loginUser(email, password);
    storeAuth(token, authUser);
    setUser(authUser);
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
