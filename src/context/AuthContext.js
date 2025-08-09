import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { isLogin, doLogin, doLogout, doSignup } from "../services/user_service";

export const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  const checkAuth = async () => {
    try {
      const status = await isLogin();
      setIsLoggedIn(status);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (userData) => {
    try {
      const res = await doLogin(userData);
      if (res?.token) {
        setIsLoggedIn(true);
        toast.success("Login successful!");
        navigate("/"); // Redirect to home page after successful login
      }
      return res;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Login failed");
      return null;
    }
  };

  const signup = async (userData) => {
    try {
      const res = await doSignup(userData);
      toast.success("Signup successful!");
      return res;
    } catch (error) {
      toast.error(error?.response?.data?.message || "Signup failed");
      return null;
    }
  };

  const logout = async () => {
    try {
      await doLogout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
    setIsLoggedIn(false);
    toast.success("Logged out successfully!");
    navigate("/");
  };

  useEffect(() => {
    checkAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, isLoading, login, signup, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};
