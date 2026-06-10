import { createContext, useEffect, useState } from "react";

const AUTH_STORAGE_KEY = "seaside-auth";
const AuthContext = createContext({});

const loadStoredAuth = () => {
  if (typeof window === "undefined") return {};
  try {
    const stored = localStorage.getItem(AUTH_STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const parseJwt = (token) => {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => `%${('00' + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const isTokenValid = (token) => {
  if (!token) return false;
  const payload = parseJwt(token);
  return Boolean(payload?.exp && payload.exp * 1000 > Date.now());
};

export const AuthProvider = ({ children }) => {
  const [auth, setAuthState] = useState(() => loadStoredAuth());

  useEffect(() => {
    try {
      if (auth && Object.keys(auth).length > 0) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(auth));
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch {
      // ignore storage errors
    }
  }, [auth]);

  useEffect(() => {
    const refreshAuth = async () => {
      if (!auth?.accessToken || !auth?.refreshToken) return;
      if (isTokenValid(auth.accessToken)) return;

      try {
        const response = await fetch("http://localhost:8080/api/auth/refresh", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken: auth.refreshToken }),
        });

        if (!response.ok) throw new Error("Unable to refresh token");
        const data = await response.json();
        setAuthState((current) => ({
          ...current,
          accessToken: data.token,
          refreshToken: data.refreshToken || current.refreshToken,
          userRole: data.role || current.userRole,
        }));
      } catch {
        setAuthState({});
      }
    };

    refreshAuth();
  }, []);

  const setAuth = (nextAuth) => {
    setAuthState(nextAuth && Object.keys(nextAuth).length ? nextAuth : {});
  };

  const logout = () => setAuthState({});

  return (
    <AuthContext.Provider value={{ auth, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
