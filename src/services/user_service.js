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
      console.log("Token is expired");
      return false;
    }

    return true;
  } catch (error) {
    console.log("Error validating token:", error);
    return false;
  }
};

// Check if user is logged in - simple validation without server calls
export const isLogin = async () => {
  try {
    const token = await getTokenFromDB();
    console.log("Checking login status from IndexedDB:", !!token);

    if (!token) {
      return false;
    }

    // Validate token locally (check expiration)
    const isValid = validateToken(token);
    console.log("Token validation result:", isValid);

    if (!isValid) {
      // Token is invalid, clear it
      await clearEntireDB();
      setAuthToken(null);
      console.log("Invalid token cleared from IndexedDB");
      return false;
    }

    // Set the token in axios headers for future requests
    setAuthToken(token);
    return true;
  } catch (error) {
    console.log("Error checking login status:", error);
    return false;
  }
};

// Login user and save tokens + user data
export const doLogin = async (userData) => {
  try {
    console.log("doLogin called with data:", userData);
    const response = await myAxios.post("/api/v1/auth/login", userData);
    const { token, refreshToken, user } = response.data;

    console.log("Login response:", response.data);

    // Save complete auth data using the new function
    if (token || refreshToken || user) {
      await saveCompleteAuthData(response.data);
      console.log("Complete auth data saved to IndexedDB");
    }

    // Set the main token for immediate use
    if (token) {
      setAuthToken(token);
      console.log("Auth token set in axios headers");
    }

    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

// Alias for doLogin to maintain compatibility
export const login = doLogin;

// Signup user
export const doSignup = async (userData) => {
  try {
    console.log("doSignup called with data:", userData);

    // Transform the data to match server expectations
    const signupData = {
      name: userData.name,
      email: userData.email,
      password: userData.password, // Server expects 'password' not 'rawPassword'
      about: userData.bio, // Server expects 'about' instead of 'bio'
    };

    console.log("Transformed signup data:", signupData);
    console.log("Making API call to /api/v1/auth/register...");

    const response = await myAxios.post("/api/v1/auth/register", signupData);
    let result = response.data;
    console.log("Signup successful:", result);
    return result;
  } catch (error) {
    console.error("Signup error:", error);
    console.error("Error response:", error.response?.data);
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

        console.log("Sending logout request to server with tokens...");
        await myAxios.post("/api/v1/auth/logout", logoutPayload);
        console.log("Server logout successful - tokens invalidated on server");
      } catch (error) {
        console.log("Server logout failed, but clearing local data:", error);
        // Continue with local cleanup even if server logout fails
      }
    } else {
      console.log("No tokens found, skipping server logout");
    }
  } catch (error) {
    console.log("Error during logout process:", error);
  } finally {
    // Always clear all local data regardless of server response
    await clearEntireDB(); // This clears authToken, refreshToken, userData, and routeLogs
    setAuthToken(null);
    console.log(
      "User logged out - all auth data cleared from IndexedDB (including refresh token)"
    );
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
        console.log("Auth initialized from IndexedDB with valid token");
      } else {
        await clearEntireDB();
        setAuthToken(null);
        console.log("Invalid token found, cleared from IndexedDB");
      }
    } else {
      console.log("No token found in IndexedDB");
    }
  } catch (error) {
    console.log("Error initializing auth from IndexedDB:", error);
    // Don't clear token on initialization errors
  }
};

//get current user data
export const getCurrentUser = async () => {
  try {
    // Get cached user data from IndexedDB
    const cachedUserData = await getUserData();
    if (cachedUserData) {
      console.log("Using cached user data:", cachedUserData);
      return cachedUserData;
    }

    // If no cached data, throw error since we don't have /api/v1/auth/me endpoint
    console.log("No cached user data found in IndexedDB");
    throw new Error("No user data available. Please login again.");
  } catch (error) {
    console.error("Error getting current user:", error);
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

    console.log("Attempting to refresh access token...");

    // Call refresh token endpoint
    const response = await myAxios.post("/api/v1/auth/refresh", {
      refreshToken: refreshToken,
    });

    const { token, refreshToken: newRefreshToken, user } = response.data;

    // Save new tokens and user data
    if (token || newRefreshToken || user) {
      await saveCompleteAuthData(response.data);
      console.log("New auth data saved after refresh");
    }

    // Set new token in headers
    if (token) {
      setAuthToken(token);
      console.log("New access token set in axios headers");
    }

    return response.data;
  } catch (error) {
    console.error("Token refresh failed:", error);
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
        console.log("Access token expired, attempting refresh...");
        await refreshAccessToken();
        console.log("Token refreshed successfully");
        return true;
      } catch (refreshError) {
        console.error("Token refresh failed:", refreshError);
        await clearEntireDB();
        setAuthToken(null);
        throw new Error("Token is expired and refresh failed");
      }
    }

    setAuthToken(token);
    return true;
  } catch (error) {
    console.error("Token validation failed:", error);
    return false;
  }
};

// Clear only refresh token (useful for security purposes)
export const clearRefreshToken = async (reason = "manual") => {
  try {
    await clearRefreshTokenFromDB();
    console.log(`Refresh token cleared from IndexedDB - Reason: ${reason}`);
    return true;
  } catch (error) {
    console.error("Error clearing refresh token:", error);
    return false;
  }
};

// Security function - clear refresh token on suspicious activity
export const securityClearRefreshToken = async (reason) => {
  console.warn(`Security measure triggered: ${reason}`);
  await clearRefreshToken(`security-${reason}`);
  // Could also notify server about suspicious activity
  try {
    await myAxios.post("/api/v1/auth/security-alert", {
      reason: reason,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.log("Failed to notify server about security event:", error);
  }
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

    return {
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
