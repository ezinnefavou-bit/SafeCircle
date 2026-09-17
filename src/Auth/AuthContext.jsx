import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiFetch, clearStoredToken, extractToken, extractUser, getStoredToken, storeToken } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      const token = getStoredToken();
      if (!token) {
        if (active) setLoading(false);
        return;
      }
      try {
        const data = await apiFetch("/auth/me");
        if (active) setUser(extractUser(data));
      } catch (error) {
        if (error.status === 401 || error.status === 403) clearStoredToken();
        if (active) setUser(null);
      } finally {
        if (active) setLoading(false);
      }
    }
    restoreSession();
    return () => { active = false; };
  }, []);

  async function login(email, password) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const token = extractToken(data);
    if (!token) throw new Error("Login succeeded but the API did not return a JWT token.");
    storeToken(token);

    const currentUser = extractUser(data);
    if (currentUser) {
      setUser(currentUser);
      return currentUser;
    }
    const me = await apiFetch("/auth/me");
    const meUser = extractUser(me);
    setUser(meUser);
    return meUser;
  }

  async function logout() {
    try { await apiFetch("/auth/logout", { method: "POST" }); } catch { /* local logout still completes */ }
    clearStoredToken();
    setUser(null);
  }

  const value = useMemo(() => ({
    user,
    loading,
    login,
    logout,
    updateUser: setUser,
    isAuthenticated: Boolean(user),
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { return useContext(AuthContext); }
