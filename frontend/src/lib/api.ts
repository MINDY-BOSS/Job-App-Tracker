import axios, { AxiosError } from "axios";

import { ROUTES } from "@/constants/routes";
import { clearToken, getToken } from "./auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000/api",
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Session expired or rejected — drop the token and bounce to login.
    if (error.response?.status === 401 && typeof window !== "undefined") {
      clearToken();
      if (window.location.pathname !== ROUTES.login) {
        window.location.href = ROUTES.login;
      }
    }
    return Promise.reject(error);
  },
);

/** Pulls the API's message out of an axios error for display in forms. */
export function getApiErrorMessage(
  error: unknown,
  fallback = "Something went wrong. Please try again.",
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string | string[] } | undefined;
    if (Array.isArray(data?.message)) return data.message.join(", ");
    if (data?.message) return data.message;
    return error.message;
  }
  return fallback;
}
