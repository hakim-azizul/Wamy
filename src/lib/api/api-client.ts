import { fetchAuthJwt, jwtExpiry } from "@/lib/auth-client";
import type { ScoreTransaction } from "@/lib/types/scores";
import type { StudentFullDetailsBundle } from "@/lib/types/studentDetails";
import type { IUser } from "@/lib/types/users";

const DEV_API_URL = "http://localhost:5000";
const RAW_API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").trim();
const IS_PRODUCTION = process.env.NODE_ENV === "production";

/** Normalize and validate an absolute http(s) API base URL. */
function normalizeApiUrl(value: string, label: string): string {
  let parsed: URL;
  try {
    parsed = new URL(value);
  } catch {
    throw new Error(`${label} must be an absolute URL (e.g. https://api.example.com). Got: ${value || "(empty)"}`);
  }
  if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
    throw new Error(`${label} must use http or https. Got: ${parsed.protocol}`);
  }
  return parsed.toString().replace(/\/$/, "");
}

let warned = false;

/**
 * Resolve the Express API base URL at call time.
 * NEXT_PUBLIC_* values are inlined at BUILD time on Vercel — changing the value
 * afterwards requires a fresh redeploy. In production there is deliberately no
 * silent localhost fallback.
 */
export function getApiBaseUrl(): string {
  if (!IS_PRODUCTION && !RAW_API_URL) {
    if (!warned) {
      console.warn("[api-client] NEXT_PUBLIC_API_URL is not set; using local dev fallback http://localhost:5000.");
      warned = true;
    }
    return DEV_API_URL;
  }

  if (!RAW_API_URL) {
    throw new ApiError(
      "NEXT_PUBLIC_API_URL is not configured. Set it on the wamy-client Vercel project to the deployed wamy-server URL, then redeploy.",
      0,
    );
  }

  const url = normalizeApiUrl(RAW_API_URL, "NEXT_PUBLIC_API_URL");
  if (IS_PRODUCTION && url.startsWith("http://")) {
    console.warn("[api-client] NEXT_PUBLIC_API_URL uses http:// in production; https:// is recommended.");
  }
  return url;
}

/** Backwards-compatible constant (prefer getApiBaseUrl() when making requests). */
export const API_BASE_URL = RAW_API_URL || DEV_API_URL;

const TOKEN_STORAGE_KEY = "wamy_token";

export type AuthResponse = { token: string; user: IUser };
export type UserResponse = { user: IUser };
export type UsersResponse = { users: IUser[] };
export type StudentDetailsBundleResponse = StudentFullDetailsBundle;
export type SectionSaveResponse = {
  section: Record<string, unknown> & { _id?: string; userId?: string; isCompleted?: boolean };
  completionSummary: { completedSections: number; totalSections: 5 };
};
export type ScoreTransactionsResponse = { transactions: ScoreTransaction[]; count: number };
export type ScoreAdjustResponse = { transaction: ScoreTransaction; student: IUser };

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

/**
 * Return a valid Better Auth JWT for wamy-server, refreshing from
 * GET /api/auth/token when the cached token is missing or near expiry.
 */
export async function getBearerToken(): Promise<string | null> {
  const cached = getToken();
  const expiresAt = jwtExpiry(cached);
  const nowSeconds = Math.floor(Date.now() / 1000);

  if (cached && expiresAt && expiresAt > nowSeconds + 30) return cached;

  const fresh = await fetchAuthJwt();
  if (fresh) setToken(fresh);
  return fresh ?? cached;
}

/** Simple fetch wrapper that attaches the bearer token and unwraps API errors. */
export async function apiFetch<T>(
  path: string,
  init: RequestInit & { headers?: Record<string, string> } = {},
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${path}`;
  const token = await getBearerToken();

  if (!token) {
    throw new ApiError("لا توجد جلسة نشطة. سجّل الدخول ثم حاول مرة أخرى.", 401);
  }

  let response: Response;
  try {
    response = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(init.headers ?? {}),
      },
    });
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(
      `تعذر الاتصال بالخادم على ${baseUrl}. تحقق من أن wamy-server منشور وأن NEXT_PUBLIC_API_URL يشير إلى رابطه الصحيح، ثم أعد النشر (Redeploy).`,
      0,
    );
  }

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
