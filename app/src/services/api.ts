import axios from "axios";
import { getStoredToken, UNAUTHORIZED_EVENT } from "@/lib/authStorage";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  timeout: 30000,
});

// Attach the auth token (if present) to every request.
api.interceptors.request.use((config) => {
  const token = getStoredToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// If the server rejects our token (expired, revoked), tell the app so it can
// log the user out cleanly instead of leaving them in a half-signed-in state.
// Failed login/register attempts also return 401 and must not trigger this.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const url: string = error.config?.url ?? "";
    const isCredentialAttempt = url.startsWith("/auth/login") || url.startsWith("/auth/register");
    if (error.response?.status === 401 && !isCredentialAttempt && getStoredToken()) {
      window.dispatchEvent(new Event(UNAUTHORIZED_EVENT));
    }
    return Promise.reject(error);
  }
);
