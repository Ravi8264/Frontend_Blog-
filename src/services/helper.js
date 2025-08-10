// axios.js
import axios from "axios";
import { currentApiConfig } from "../config/api";

// Use configuration from api.js
export const BASE_URL = currentApiConfig.baseURL;

export const myAxios = axios.create({
  baseURL: BASE_URL,
  timeout: currentApiConfig.timeout,
});

export const setAuthToken = (token) => {
  if (token) {
    myAxios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete myAxios.defaults.headers.common["Authorization"];
  }
};
