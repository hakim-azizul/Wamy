import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Only NEXT_PUBLIC_* is available in the browser. When unset, Better Auth uses
// the current origin (/api/auth on the same domain), which is correct on Vercel.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim() || undefined,
  plugins: [jwtClient()],
});

export const { signIn, signUp, useSession } = authClient;

/**
 * Fetch a fresh JWT from Better Auth (/api/auth/token) for the current session.
 * The cookie is sent same-origin; no secret or hardcoded key lives in the browser.
 */
export async function fetchAuthJwt(): Promise<string | null> {
  try {
    const response = await authClient.$fetch<{ token: string }>("/token", {
      method: "GET",
    });
    const token = (response.data as { token?: string } | null)?.token;
    return typeof token === "string" && token ? token : null;
  } catch {
    return null;
  }
}

/** Read the `exp` claim (seconds) from a JWT without verifying it (refresh hint only). */
export function jwtExpiry(token: string | null): number | null {
  if (!token) return null;
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/"))) as { exp?: number };
    return typeof decoded.exp === "number" ? decoded.exp : null;
  } catch {
    return null;
  }
}
