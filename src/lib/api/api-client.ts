import type { IUser } from "@/lib/types/users";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const TOKEN_STORAGE_KEY = "wamy_token";

export type AuthResponse = { token: string; user: IUser };
export type UserResponse = { user: IUser };
export type UsersResponse = { users: IUser[] };

export class ApiError extends Error {
  readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_STORAGE_KEY);
}

export function setToken(token: string): void {
  window.localStorage.setItem(TOKEN_STORAGE_KEY, token);
}

export function clearToken(): void {
  window.localStorage.removeItem(TOKEN_STORAGE_KEY);
}

/** Simple fetch wrapper that attaches the bearer token and unwraps API errors. */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { headers?: Record<string, string> } = {},
): Promise<T> {
  const token = getToken();
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  const payload: unknown = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "message" in payload &&
      typeof (payload as { message: unknown }).message === "string"
        ? (payload as { message: string }).message
        : "Request failed. Please try again.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}
