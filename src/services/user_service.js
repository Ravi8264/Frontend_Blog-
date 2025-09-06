import { myAxios, setAuthToken } from "./helper";
import {
  getTokenFromDB,
  getRefreshTokenFromDB,
  getUserDataFromDB,
  saveTokenToDB,
  saveRefreshTokenToDB,
  saveUserData,
  clearUserDataFromDB,
  StopsStore,
} from "../indexdb/indexdb";

// Simple token validation
const validateToken = (token) => {
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.exp > Date.now() / 1000;
  } catch (error) {
    return false;
  }
};

// Check if user is logged in
export const isLogin = async () => {
  const token = await getTokenFromDB();
  return validateToken(token);
};

// Login user
export const doLogin = async (userData) => {
  const response = await myAxios.post("/api/v1/auth/login", userData);

  // Save JWT token and user data to IndexDB
  if (response.data.token) {
    await saveTokenToDB(response.data.token);
    setAuthToken(response.data.token);
  }

  if (response.data.refreshToken) {
    await saveRefreshTokenToDB(response.data.refreshToken);
  }

  if (response.data.user) {
    await saveUserData(response.data.user);
  }

  return response.data;
};

export const login = doLogin;

// Signup user
export const doSignup = async (userData) => {
  const signupData = {
    name: userData.name,
    email: userData.email,
    password: userData.password,
    about: userData.bio,
  };

  const response = await myAxios.post("/api/v1/auth/register", signupData);
  return response.data;
};

export const signup = doSignup;

// Logout user
export const doLogout = async () => {
  const token = await getTokenFromDB();
  const refreshToken = await getRefreshTokenFromDB();

  if (token || refreshToken) {
    await myAxios.post("/api/v1/auth/logout", { token, refreshToken });
  }

  await clearUserDataFromDB();
  setAuthToken(null);
};

// Initialize authentication
export const initAuth = async () => {
  const token = await getTokenFromDB();

  if (token && validateToken(token)) {
    setAuthToken(token);
  } else {
    await clearUserDataFromDB();
    setAuthToken(null);
  }
};

// Get current user data
export const getCurrentUser = async () => {
  const userData = await getUserDataFromDB();
  if (!userData) throw new Error("No user data available");
  return userData;
};

// Refresh access token
export const refreshAccessToken = async () => {
  const refreshToken = await getRefreshTokenFromDB();
  if (!refreshToken) throw new Error("No refresh token found");

  const response = await myAxios.post("/api/v1/auth/refresh", { refreshToken });

  if (response.data.token) {
    await saveTokenToDB(response.data.token);
  }

  if (response.data.refreshToken) {
    await saveRefreshTokenToDB(response.data.refreshToken);
  }

  if (response.data.user) {
    await saveUserData(response.data.user);
  }

  if (response.data.token) {
    setAuthToken(response.data.token);
  }

  return response.data;
};

// Ensure valid token
export const ensureValidToken = async () => {
  const token = await getTokenFromDB();
  if (!token) throw new Error("No token found");

  if (!validateToken(token)) {
    await refreshAccessToken();
  } else {
    setAuthToken(token);
  }

  return true;
};

// Clear refresh token
export const clearRefreshToken = async () => {
  const db = new StopsStore();
  await db.do("delete", "refreshToken");
  return true;
};

// Security function
export const securityClearRefreshToken = async (reason) => {
  const db = new StopsStore();
  await db.do("delete", "refreshToken");
  await myAxios.post("/api/v1/auth/security-alert", { reason });
};

// Debug function
// Debug function
export const getCurrentTokenInfo = async () => {
  const token = await getTokenFromDB();
  const refreshToken = await getRefreshTokenFromDB();

  return {
    isLoggedIn: validateToken(token),
    hasRefreshToken: !!refreshToken,
    user: await getUserDataFromDB(),
  };
};
