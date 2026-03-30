import axios from "axios";
import { tokenStore } from "../utils/storage";

export const api = axios.create({
baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5166/api",  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = tokenStore.get();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg =
      err?.response?.data?.message ||
      err?.response?.data ||
      err?.message ||
      "Hiba történt";
    return Promise.reject(new Error(msg));
  }
);
