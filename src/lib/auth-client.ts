import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  /** Base URL of the Better Auth handler in the client (NEXT_PUBLIC_ is required in the browser). */
  baseURL: process.env.NEXT_PUBLIC_BETTER_AUTH_URL || process.env.BETTER_AUTH_URL,
});

// Keep the established exports. The Express API currently owns user/RBAC state;
// these hooks remain available for the planned unified Better Auth session.
export const { signIn, signUp, useSession } = authClient;
