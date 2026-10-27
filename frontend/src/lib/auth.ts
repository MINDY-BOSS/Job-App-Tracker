import type { User } from "@/types/auth.types";

/**
 * The access token lives in a cookie (not localStorage) so `proxy.ts` can do an
 * optimistic redirect on the server before the dashboard renders.
 */
export const AUTH_COOKIE = "jt_access_token";

const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export function getToken(): string | null {
  if (typeof document === "undefined") return null;

  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${AUTH_COOKIE}=`));

  return match ? decodeURIComponent(match.split("=")[1]) : null;
}

export function setToken(token: string) {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${AUTH_COOKIE}=${encodeURIComponent(
    token,
  )}; Path=/; Max-Age=${MAX_AGE_SECONDS}; SameSite=Lax${secure}`;
}

export function clearToken() {
  if (typeof document === "undefined") return;
  document.cookie = `${AUTH_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax`;
}

export function isAuthenticated() {
  return getToken() !== null;
}

/** Decodes the JWT payload without verifying it — display only, never trust. */
export function decodeUserFromToken(token: string): Partial<User> | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const claims = JSON.parse(json) as { sub?: string; email?: string };
    return { id: claims.sub, email: claims.email };
  } catch {
    return null;
  }
}
