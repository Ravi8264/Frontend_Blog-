import axios from "axios";
import { API_BASE_URL } from "../config/config";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: false,
});

// No need to force HTTP protocol when using Netlify proxy
// The proxy handles HTTPS to HTTP conversion

export default api;
