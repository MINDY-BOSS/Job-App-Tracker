"use client";

import { useQuery } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { User } from "@/types/auth.types";

export type CurrentUser = Pick<User, "id" | "email" | "name">;

export const CURRENT_USER_KEY = ["me"] as const;

/**
 * The signed-in user (the JWT identifies who), or null until it has loaded.
 * A 401 is handled by the api interceptor (clears the token, goes to /login).
 */
export function useCurrentUser(): CurrentUser | null {
  const { data } = useQuery({
    queryKey: CURRENT_USER_KEY,
    queryFn: async () => (await api.get<CurrentUser>("/auth/me")).data,
    staleTime: Infinity,
  });
  return data ?? null;
}

export function getFirstName(user: CurrentUser | null) {
  return user?.name?.trim().split(/\s+/)[0] ?? null;
}

export function getInitials(user: CurrentUser | null) {
  const source = user?.name?.trim() || user?.email || "";
  const words = source.split(/[\s@.]+/).filter(Boolean);
  if (words.length === 0) return "";
  return (user?.name?.trim() ? words.slice(0, 2) : words.slice(0, 1))
    .map((word) => word[0].toUpperCase())
    .join("");
}
