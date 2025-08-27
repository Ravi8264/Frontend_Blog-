import { myAxios, setAuthToken } from "./helper";
import {
  saveTokenToDB,
  getUserDataFromDB,
  getTokenFromDB,
  saveUserData,
  clearEntireDB,
  saveRefreshTokenToDB,
  getRefreshTokenFromDB,
  saveCompleteAuthData,
  getCompleteAuthData,
  getTokensFromDB,
  clearRefreshTokenFromDB,
  clearAllAuthDataFromDB,
} from "../indexdb/indexdb";

const saveToken = async (token) => {
  await saveTokenToDB(token);
  setAuthToken(token);
};

// Get user data from IndexedDB
const getUserData = async () => {
  return await getUserDataFromDB();
};

// Simple token validation - just check if token exists and is not expired
const validateToken = (token) => {
  if (!token) return false;

  try {
    // Decode JWT token to check expiration
    const payload = JSON.parse(atob(token.split(".")[1]));
    const currentTime = Date.now() / 1000;

    // Check if token is expired
    if (payload.exp && payload.exp < currentTime) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Token validation error:", error);
    return false;
  }
};

// Check if user is logged in - simple validation without server calls
export const isLogin = async () => {
  try {
    const token = await getTokenFromDB();

    if (!token) {
      return false;
    }

    // Validate token locally (check expiration)
    const isValid = validateToken(token);

    if (!isValid) {
      // Token is invalid, clear it
      await clearEntireDB();
      setAuthToken(null);
      return false;
    }

    // Set the token in axios headers for future requests
    setAuthToken(token);

    // Also check if we have user data to ensure complete authentication
    const userData = await getUserDataFromDB();
    if (!userData) {
      return false;
    }

    return true;
  } catch (error) {
    console.error("Error in isLogin:", error);
    return false;
  }
};

// Login user and save tokens + user data
export const doLogin = async (userData) => {
  try {
    const response = await myAxios.post("/api/v1/auth/login", userData);
    const { token, refreshToken, user } = response.data;

    // Save complete auth data using the new function
    if (token || refreshToken || user) {
      await saveCompleteAuthData(response.data);
    }

    // Set the main token for immediate use
    if (token) {
      setAuthToken(token);
    }

    return response.data;
  } catch (error) {
    throw error;
  }
};

// Alias for doLogin to maintain compatibility
export const login = doLogin;

// Signup user
export const doSignup = async (userData) => {
  try {
    // Transform the data to match server expectations
    const signupData = {
      name: userData.name,
      email: userData.email,
      password: userData.password, // Server expects 'password' not 'rawPassword'
      about: userData.bio, // Server expects 'about' instead of 'bio'
    };

    const response = await myAxios.post("/api/v1/auth/register", signupData);
    let result = response.data;
    return result;
  } catch (error) {
    throw error;
  }
};

// Alias for doSignup to maintain compatibility
export const signup = doSignup;

// Logout user and clear auth data (including refresh token)
export const doLogout = async () => {
  try {
    // Get both tokens to send to server for invalidation
    const { token, refreshToken } = await getTokensFromDB();

    if (token || refreshToken) {
      try {
        // Send both tokens to server for proper invalidation
        const logoutPayload = {};
        if (token) logoutPayload.token = token;
        if (refreshToken) logoutPayload.refreshToken = refreshToken;

        await myAxios.post("/api/v1/auth/logout", logoutPayload);
      } catch (error) {
        // Continue with local cleanup even if server logout fails
      }
    }
  } catch (error) {
    // Continue with cleanup
  } finally {
    // Always clear all local data regardless of server response
    await clearEntireDB(); // This clears authToken, refreshToken, userData, and routeLogs
    setAuthToken(null);
  }
};

// Optional: Call this once when the app starts - simple validation
export const initAuth = async () => {
  try {
    const token = await getTokenFromDB();
    if (token) {
      const isValid = validateToken(token);
      if (isValid) {
        setAuthToken(token);
      } else {
        await clearEntireDB();
        setAuthToken(null);
      }
    }
  } catch (error) {
    // Don't clear token on initialization errors
  }
};

//get current user data
export const getCurrentUser = async () => {
  try {
    // Get cached user data from IndexedDB
    const cachedUserData = await getUserData();
    if (cachedUserData) {
      return cachedUserData;
    }

    // If no cached data, throw error since we don't have /api/v1/auth/me endpoint

    throw new Error("No user data available. Please login again.");
  } catch (error) {
    // Re-throw the error with a more descriptive message
    if (error.message.includes("No user data available")) {
      throw new Error("No user data available. Please login again.");
    }
    throw new Error("Failed to get user data. Please login again.");
  }
};

// Refresh access token using refresh token
export const refreshAccessToken = async () => {
  try {
    const refreshToken = await getRefreshTokenFromDB();
    if (!refreshToken) {
      throw new Error("No refresh token found");
    }

    // Call refresh token endpoint
    const response = await myAxios.post("/api/v1/auth/refresh", {
      refreshToken: refreshToken,
    });

    const { token, refreshToken: newRefreshToken, user } = response.data;

    // Save new tokens and user data
    if (token || newRefreshToken || user) {
      await saveCompleteAuthData(response.data);
    }

    // Set new token in headers
    if (token) {
      setAuthToken(token);
    }

    return response.data;
  } catch (error) {
    // Clear all auth data if refresh fails
    await clearEntireDB();
    setAuthToken(null);
    throw error;
  }
};

// Check and refresh token if needed
export const ensureValidToken = async () => {
  try {
    const token = await getTokenFromDB();
    if (!token) {
      throw new Error("No token found");
    }

    const isValid = validateToken(token);
    if (!isValid) {
      // Try to refresh the token
      try {
        await refreshAccessToken();
        return true;
      } catch (refreshError) {
        await clearEntireDB();
        setAuthToken(null);
        throw new Error("Token is expired and refresh failed");
      }
    }

    setAuthToken(token);
    return true;
  } catch (error) {
    return false;
  }
};

// Clear only refresh token (useful for security purposes)
export const clearRefreshToken = async (reason = "manual") => {
  try {
    await clearRefreshTokenFromDB();

    return true;
  } catch (error) {
    return false;
  }
};

// Security function - clear refresh token on suspicious activity
export const securityClearRefreshToken = async (reason) => {
  await clearRefreshToken(`security-${reason}`);
  // Could also notify server about suspicious activity
  try {
    await myAxios.post("/api/v1/auth/security-alert", {
      reason: reason,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {}
};

// Debug function to get current token info (including refresh token)
export const getCurrentTokenInfo = async () => {
  try {
    const { token, refreshToken } = await getTokensFromDB();
    const userData = await getUserDataFromDB();

    const hasToken = !!token;
    const hasRefreshToken = !!refreshToken;
    const isValid = token ? validateToken(token) : false;
    const refreshTokenValid = refreshToken
      ? validateToken(refreshToken)
      : false;

    const result = {
      hasToken,
      hasRefreshToken,
      isValid,
      refreshTokenValid,
      token: hasToken ? token.substring(0, 50) + "..." : null, // Show partial token for security
      refreshToken: hasRefreshToken
        ? refreshToken.substring(0, 50) + "..."
        : null,
      user: userData,
    };

    return result;
  } catch (error) {
    console.error("Error getting token info:", error);
    return {
      hasToken: false,
      hasRefreshToken: false,
      isValid: false,
      refreshTokenValid: false,
      token: null,
      refreshToken: null,
      user: null,
    };
  }
};
