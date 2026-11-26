import { betterAuth } from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";

const isProduction = process.env.NODE_ENV === "production";
const dbUri = process.env.DB_URI;
const dbName = process.env.DB_NAME || "WamyDorm";

if (!dbUri) {
  // Do not throw at module load (build-time prerender imports this file), but make
  // the misconfiguration obvious in Vercel build/runtime logs.
  console.error(
    "[auth] DB_URI is missing on wamy-client. Add the MongoDB URI to the wamy-client Vercel project and redeploy.",
  );
}

// The URI is only used on the server (Better Auth route handler / seed flow).
const client = new MongoClient(
  dbUri || (isProduction ? "mongodb://127.0.0.1:27017/wamy-misconfigured" : "mongodb://localhost:27017/wamy-dev"),
);
const db = client.db(dbName);

const configuredBaseUrl =
  process.env.BETTER_AUTH_URL ||
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ||
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined);

const trustedOrigins = [
  configuredBaseUrl,
  process.env.CLIENT_ORIGIN,
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL,
]
  .flatMap((value) => (value || "").split(","))
  .map((origin) => origin.trim().replace(/\/$/, ""))
  .filter(Boolean);

export const auth = betterAuth({
  baseURL: configuredBaseUrl?.replace(/\/$/, ""),
  trustedOrigins,
  emailAndPassword: {
    enabled: true,
  },
  database: mongodbAdapter(db, {
    client,
  }),
});
