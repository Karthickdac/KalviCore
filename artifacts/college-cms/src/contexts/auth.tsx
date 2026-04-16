import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import { setAuthTokenGetter } from "@workspace/api-client-react";

const API_BASE = import.meta.env.VITE_API_URL || "";

interface AuthUser {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: string;
  departmentId: number | null;
  staffRecordId: number | null;
  studentRecordId: number | null;
  courseId: number | null;
  permissions?: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (module: string) => boolean;
  hasRole: (...roles: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem("auth_token"));
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(token);

  useEffect(() => {
    tokenRef.current = token;
    setAuthTokenGetter(() => tokenRef.current);
  }, [token]);

  const fetchMe = useCallback(async (t: string) => {
    try {
      const res = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${t}` } });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return true;
      }
    } catch {}
    return false;
  }, []);

  useEffect(() => {
    if (token) {
      fetchMe(token).then((ok) => {
        if (!ok) { setToken(null); localStorage.removeItem("auth_token"); }
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [token, fetchMe]);

  const login = async (username: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: "Login failed" }));
      throw new Error(err.error || "Login failed");
    }
    const data = await res.json();
    setToken(data.token);
    localStorage.setItem("auth_token", data.token);
    const meRes = await fetch(`${API_BASE}/api/auth/me`, { headers: { Authorization: `Bearer ${data.token}` } });
    if (meRes.ok) {
      const meData = await meRes.json();
      setUser(meData);
    } else {
      setUser(data.user);
    }
  };

  const logout = async () => {
    if (token) {
      await fetch(`${API_BASE}/api/auth/logout`, { method: "POST", headers: { Authorization: `Bearer ${token}` } }).catch(() => {});
    }
    setUser(null);
    setToken(null);
    localStorage.removeItem("auth_token");
  };

  const hasPermission = (module: string): boolean => {
    if (!user) return false;
    const perms = user.permissions || [];
    return perms.includes("*") || perms.includes(module);
  };

  const hasRole = (...roles: string[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, hasPermission, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
