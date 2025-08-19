import React, { useEffect, useState } from "react";

import { AuthContext } from "@/hooks/useAuth";
import { getAPIData, postAPIData } from "@/lib/utils";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const checkAuth = async () => {
    try {
      setError(null);
      setLoading(true);

      const response = await getAPIData("/auth/me/");

      setUser(response.data);
      return true;
    } catch {
      setError("Failed to check authentication status");
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (username, password) => {
    try {
      setError(null);

      await postAPIData("/auth/token/", {
        username,
        password,
      });

      await checkAuth();
      return true;
    } catch (error) {
      setError(
        error.response?.data?.[Object.keys(error.response.data)[0]]?.[0] ||
          "Something went wrong"
      );
      return false;
    }
  };

  const logout = async () => {
    try {
      setError(null);

      await postAPIData("/auth/token/blacklist/");

      setUser(null);
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, error, login, logout, checkAuth }}
    >
      {children}
    </AuthContext.Provider>
  );
};
