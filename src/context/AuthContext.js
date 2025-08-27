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
      console.error("Auth check error:", error);
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
        console.log("Login successful, redirecting to home");
        navigate("/"); // Redirect to home page after successful login
      } else {
        console.log("Login response missing token:", res);
      }
      return res;
    } catch (error) {
      console.error("Login error:", error);
      const errorMessage = error?.response?.data?.message || "Login failed";

      if (
        errorMessage.includes("Invalid credentials") ||
        errorMessage.includes("Bad credentials")
      ) {
        toast.error(
          "Invalid email or password. Please check your credentials and try again."
        );
      } else if (errorMessage.includes("User not found")) {
        toast.error("No account found with this email. Please sign up first.");
      } else {
        toast.error(errorMessage);
      }
      return null;
    }
  };

  const signup = async (userData) => {
    try {
      const res = await doSignup(userData);
      toast.success("Signup successful! Please login with your credentials.");
      // Navigate to login page after successful signup
      navigate("/auth?mode=login");
      return res;
    } catch (error) {
      // Handle specific error cases
      const errorMessage = error?.response?.data?.message || "Signup failed";

      if (
        errorMessage.includes("duplicate key value") ||
        errorMessage.includes("already exists")
      ) {
        toast.error("This email address is already registered.");
      } else {
        toast.error(errorMessage);
      }
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
