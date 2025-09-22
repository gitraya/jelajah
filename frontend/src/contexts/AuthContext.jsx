import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";

import { AuthContext } from "@/hooks/useAuth";
import { getAPIData, getErrorMessage, postAPIData } from "@/lib/utils";

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = async ({ disableError = false } = {}) => {
    try {
      setError(null);
      setLoading(true);

      const response = await getAPIData("/auth/me/");

      setUser(response.data);
      setIsAuthenticated(true);
      return true;
    } catch {
      if (!disableError) {
        setError("Failed to check authentication status");
      }
      setUser(null);
      setIsAuthenticated(false);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      setError(null);

      await postAPIData("/auth/token/", { email, password });

      await checkAuth();
      return true;
    } catch (error) {
      setError(getErrorMessage(error));
      return false;
    }
  };

  const logout = async () => {
    try {
      setError(null);

      await postAPIData("/auth/token/blacklist/");

      setUser(null);
      setIsAuthenticated(false);

      navigate("/");
      return true;
    } catch (error) {
      setError(error.message);
      return false;
    }
  };

  // Check authentication status on mount
  useEffect(() => {
    checkAuth({ disableError: true });
  }, []);

  // Reset error when page changes or loading state changes
  useEffect(() => {
    if (error) {
      setError(null);
    }
  }, [location.pathname]);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        login,
        logout,
        checkAuth,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
