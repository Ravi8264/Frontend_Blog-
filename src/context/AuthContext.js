import React, { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isLogin, doLogin, doLogout, doSignup } from "../services/user_service";

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // Simple auth check on load
  useEffect(() => {
    const checkAuth = async () => {
      const status = await isLogin();
      setIsLoggedIn(status);
      setIsLoading(false);
    };
    checkAuth();
  }, []);

  // Login
  const login = async (userData) => {
    const res = await doLogin(userData);
    if (res?.token) {
      setIsLoggedIn(true);
      navigate("/");
    }
    return res;
  };

  // Signup
  const signup = async (userData) => {
    const res = await doSignup(userData);
    navigate("/auth?mode=login");
    return res;
  };

  // Logout
  const logout = async () => {
    await doLogout();
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
