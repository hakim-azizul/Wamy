import { createAuthClient } from "better-auth/react";

// Only NEXT_PUBLIC_* is available in the browser. When unset, Better Auth uses
// the current origin (/api/auth on the same domain), which is correct on Vercel.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL?.trim() || undefined,
});

// The Express API currently owns user/RBAC state; these hooks remain available
// for the planned unified Better Auth session.
export const { signIn, signUp, useSession } = authClient;
