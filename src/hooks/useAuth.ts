import { useState, useCallback } from "react";

const AUTH_KEY = "pdf-dark-auth";
const VALID_EMAIL = "hello@carrickcheah.com";
const VALID_PASSWORD = "654321";

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(
    () => localStorage.getItem(AUTH_KEY) === "true"
  );

  const login = useCallback((email: string, password: string): string | null => {
    if (email === VALID_EMAIL && password === VALID_PASSWORD) {
      localStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      return null;
    }
    return "Invalid email or password";
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
  }, []);

  return { isAuthenticated, login, logout };
}
