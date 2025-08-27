// API Configuration for different environments
// Development: Direct HTTP calls to backend (for local development)
// Production/Staging: Proxy calls through Netlify (relative URLs)
const API_CONFIG = {
  development: {
    // For local development, call backend directly
    baseURL: "http://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com",
    timeout: 10000,
  },
  production: {
    // Use relative URLs for Netlify proxy (no baseURL needed)
    baseURL: "",
    timeout: 15000,
  },
  staging: {
    // Use relative URLs for Netlify proxy (no baseURL needed)
    baseURL: "",
    timeout: 12000,
  },
};

// Get current environment
const getCurrentEnvironment = () => {
  if (process.env.NODE_ENV === "production") {
    return "production";
  }
  if (process.env.NODE_ENV === "development") {
    return "development";
  }
  return "production"; // default to production since we're using HTTPS everywhere
};

// Export current API configuration
export const currentApiConfig = API_CONFIG[getCurrentEnvironment()];

// Export all configurations for reference
export default API_CONFIG;
