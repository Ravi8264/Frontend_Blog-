// API Configuration for different environments
const API_CONFIG = {
  development: {
    baseURL: "http://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com",
    timeout: 10000,
  },
  production: {
    baseURL:
      process.env.REACT_APP_API_URL ||
      "http://blogapp-env.eba-fyin5khm.us-east-1.elasticbeanstalk.com",
    timeout: 15000,
  },
  staging: {
    baseURL:
      process.env.REACT_APP_API_URL || "https://your-staging-api-url.com",
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
  return "development"; // default fallback
};

// Export current API configuration
export const currentApiConfig = API_CONFIG[getCurrentEnvironment()];

// Export all configurations for reference
export default API_CONFIG;
