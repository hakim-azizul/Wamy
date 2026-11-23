# WamyDorm — Project Context (single source of truth)

This is the **only** `AGENTS.md` in the workspace. It documents BOTH repositories:
`wamy-client` (Next.js 16 App Router + TypeScript) and `wamy-server` (Node/Express + native MongoDB driver).
Keep it updated after every task. Do not create `wamy-server/AGENTS.md`.

**Client code rule:** this project uses Next.js 16.4.6. Before writing or changing client
code, read the version-matched guides in `wamy-client/node_modules/next/dist/docs/`
(especially `01-app/01-getting-started/05-server-and-client-components.md`,
`01-app/03-api-reference/03-file-conventions/route-groups.md`,
`01-app/03-api-reference/03-file-conventions/layout.md`, and
`01-app/02-guides/upgrading/version-16.md`). Remember: `params`/`searchParams`/`cookies()`
are async, `middleware` is now `proxy`, and client components need `"use client"`.

---

## 1. Finalized architecture decisions

### Roles & permissions (3 roles only)
| Role | May create | May view |
|---|---|---|
| `manager` | **only `supervisor`** | **all users** (manager, supervisor, student) |
| `supervisor` | **only `student`** | **only `student`** users |
| `student` | nothing | **only their own** profile/data |

- Public registration is **OFF** — no public sign-up page and no public sign-up endpoint.
- Login is **Email + Password**. Email is normalized with `.trim().toLowerCase()`.
- Target `role` is **forced server-side** by the route; a client can never choose or escalate it.
- Passwords are hashed (scrypt + salt) and are **never** returned by any API response.
- Better Auth (`better-auth`, `@better-auth/mongo-adapter`, `better-auth/react`) stays configured
  for session/auth hooks; the Express API is the current source of truth for users and RBAC.

### `users` collection schema (all 3 roles in one collection)
Common fields: `_id` (ObjectId), `name` (string), `email` (unique, normalized lowercase),
`password` (hashed, never exposed), `role` (`manager` | `supervisor` | `student`),
`status` (`active` | `suspended` | `archived`, default `active`), `phone` (string | null),
`createdBy` (ObjectId | null), `createdAt` (Date), `updatedAt` (Date).

`studentProfile` exists **only** when `role === "student"` and has exactly 13 fields:
1. `name` 2. `fathersName` 3. `passportNumber` (normalized `.trim().toUpperCase()`)
4. `passportExpiryDate` 5. `residencePermitExpiryDate` 6. `countryOrNationality`
7. `university` 8. `faculty` 9. `department` 10. `academicYear` 11. `apartmentNumber`
12. `roomNumber` 13. **`score`** (number; initialized from `INITIAL_REVIEW_SCORE`,
editable later by an authorized/manager role; client cannot set it at creation).

Future collections (attendance, fees, leaves, documents) will be **separate** collections linked
by `studentId` referencing the student's `users._id`. Keep `users` clean — do not embed them.

### Folder conventions
- `wamy-client/src/app/(root)` — public pages/layout (home, sign-in). Keep `Home`/`shared` intact.
- `wamy-client/src/app/(dashboard)` — authenticated dashboard layout + role-based pages.
- `wamy-client/src/app/api` — existing Better Auth catch-all route (keep intact).
- `wamy-client/src/Componenets/(root)` and `.../(dashboard)` — matching UI components
  (note the existing `Componenets` spelling is intentional; keep it).
- `wamy-client/src/lib/types/users.ts` — `UserRole`, `UserStatus`, `StudentProfile` (score #13), `IUser`.
- `wamy-server/index.js` — entry point; mounts routes directly; keeps `connectToMongoDB()` export.

---

## 2. Files created / modified

### Step 2 — types, config, DB & validation helpers (DONE)
Client:
- `wamy-client/src/lib/types/users.ts` — **created** (replaces the old extensionless
  `src/lib/types/users` placeholder file, which was removed). Final 13-field `StudentProfile`.
  Legacy aliases `tUserRole`/`tUserStatus`/`IStudentProfile` kept for compatibility. `IUser`
  deliberately has no `password` field.

Server:
- `wamy-server/config.js` — **created**: reads `DB_URI`, `DB_NAME`, `PORT`,
  `INITIAL_REVIEW_SCORE`, `AUTH_SECRET`, `CLIENT_ORIGIN`.
- `wamy-server/db.js` — **created**: `connectToMongoDB()`, `getDb()`, `usersCollection()`,
  `ensureIndexes()` (unique email index), `closeMongoDB()`.
- `wamy-server/utils/password.js` — **created**: `hashPassword()`, `verifyPassword()` (scrypt, no deps).
- `wamy-server/utils/token.js` — **created**: `issueToken()`, `verifyToken()` — isolated HMAC
  bearer-token logic so real JWT verification can be dropped in later without route changes.
- `wamy-server/utils/validation.js` — **created**: email/passport normalization, login,
  supervisor and student payload validators (student validates the 12 input profile fields;
  `score` is server-set), score validator, `isValidObjectId()`.
- `wamy-server/services/users.js` — **created**: `toSafeUser()` (strips password, stringifies
  ObjectIds), `findUserByEmail()`, `findUserById()`, `createUser()`, `listUsers()`,
  `updateStudentScore()`.

### Step 3 — server routes & middleware (DONE)
Server:
- `wamy-server/middleware.js` — **created**: `verifyUser` (Bearer token -> fresh DB user,
  `req.userId` + safe `req.user`, rejects non-active accounts), `isManager`, `isSupervisor`.
- `wamy-server/routes/auth.js` — **created**: `POST /login`, `GET /me` (public login only).
- `wamy-server/routes/users.js` — **created**: `POST /supervisors` (manager),
  `POST /students` (supervisor), `GET /` (role-scoped list), `GET /me`,
  `PATCH /:id/score` (manager). Duplicate email -> 409.
- `wamy-server/index.js` — **rewritten**: defines `const app = express()`, uses `config.port`,
  mounts routes, 404/error handlers, `ensureIndexes()`, starts after DB connect, and still
  exports `connectToMongoDB()`. Fixes the original undefined `app`/`PORT` bugs.
- All server `.js` files pass `node --check`.

### Step 4 — client pages & components (DONE)
Client — new:
- `src/lib/api-client.ts` — **created**: `API_BASE_URL`, bearer-token storage (`wamy_token` in
  localStorage), `apiFetch<T>()`, `ApiError`, `AuthResponse`/`UserResponse`/`UsersResponse` types.
- `src/lib/format.ts` — **created**: `formatDate()` (accepts Date or JSON date string).
- `src/lib/labels.ts` — **created**: Arabic role/status labels and role badge classes.
- `src/Componenets/(root)/shared/SignInForm.tsx` — **created**: email+password form, calls
  `POST /api/auth/login`, stores token, redirects to `/dashboard`. No sign-up UI.
- `src/app/(root)/signin/page.tsx` — **created**: public sign-in page (URL `/signin`).
- `src/app/(dashboard)/layout.tsx` — **created**: wraps dashboard in `DashboardShell`.
- `src/app/(dashboard)/dashboard/page.tsx` — **created**: renders `RoleBasedView` (URL `/dashboard`).
- `src/Componenets/(dashboard)/shared/DashboardShell.tsx` — **created**: client auth guard
  (`GET /api/auth/me`, redirect to `/signin`), header/aside, logout, `DashboardUserContext` +
  `useDashboardUser()` hook.
- `src/Componenets/(dashboard)/shared/RoleBasedView.tsx` — **created**: switches on `user.role`.
- `src/Componenets/(dashboard)/shared/UsersTable.tsx` — **created**: shared user table with score column.
- `src/Componenets/(dashboard)/manager/ManagerView.tsx` — **created**: create supervisor + all users.
- `src/Componenets/(dashboard)/supervisor/SupervisorView.tsx` — **created**: create student with all
  12 input profile fields + login credentials; score is server-set; list students.
- `src/Componenets/(dashboard)/student/StudentView.tsx` — **created**: own profile + score card.

Client — modified:
- `src/Componenets/(root)/shared/Navbar.tsx` — member-login button now links to `/signin`.
- `src/Componenets/(root)/shared/Footer.tsx` — member-login link `#signin` -> `/signin`.
- `src/lib/auth-client.ts` — fixed double `createAuthClient()` call; kept `signIn`, `signUp`,
  `useSession` exports; uses `NEXT_PUBLIC_BETTER_AUTH_URL`.
- `src/lib/auth.ts` — Mongo URI now read from `DB_URI` with localhost fallback.
- Left intact: root layout/pages, `Home`/`shared` root components, `src/app/api/auth/[...all]/route.ts`.

Verification: `npx tsc --noEmit` passed; `npm run build` passed (routes: `/`, `/signin`,
`/dashboard`, `/api/auth/[...all]`).

---

## 3. Server API (implemented)

| Method | Path | Middleware | Purpose |
|---|---|---|---|
| GET | `/` | — | Health check (`WamyDorm Server is live`) |
| POST | `/api/auth/login` | — | Email+password → `{ token, user }` |
| GET | `/api/auth/me` | `verifyUser` | Current safe user |
| POST | `/api/users/supervisors` | `verifyUser`, `isManager` | Create supervisor (role forced) |
| POST | `/api/users/students` | `verifyUser`, `isSupervisor` | Create student (role forced, score initialized) |
| GET | `/api/users` | `verifyUser` | manager → all; supervisor → students; student → self |
| GET | `/api/users/me` | `verifyUser` | Own profile |
| PATCH | `/api/users/:id/score` | `verifyUser`, `isManager` | Edit student `studentProfile.score` |

Middleware contract: `verifyUser` reads `Authorization: Bearer <token>`, verifies it, loads the
fresh user from MongoDB, rejects suspended/archived users, then sets `req.user` (safe) and
`req.userId`. `isManager` and `isSupervisor` check `req.user.role` and return 403 otherwise.
All responses use `{ user }`, `{ users }`, `{ error, message }` shapes; **no password ever**.

---

## 4. Environment variables

**`wamy-server/.env`**
- `DB_URI` (required) — MongoDB connection string.
- `DB_NAME` (optional) — defaults to the database in `DB_URI`.
- `PORT` (optional, default `5000`).
- `INITIAL_REVIEW_SCORE` (optional, default `100`) — starting value of `studentProfile.score`.
- `AUTH_SECRET` (required in production) — HMAC secret for login tokens; replace with JWT secret when migrating.
- `CLIENT_ORIGIN` (optional, default `http://localhost:3000`) — allowed CORS origin.

**`wamy-client/.env`**
- `NEXT_PUBLIC_API_URL` (default `http://localhost:5000`) — Express base URL for `apiFetch`.
- `NEXT_PUBLIC_BETTER_AUTH_URL` / `BETTER_AUTH_URL` — Better Auth base URL (client hooks only).
- `DB_URI` — used by `src/lib/auth.ts` mongodbAdapter (Better Auth side).

Never commit real `.env` values.

---

## 5. Current progress / open tasks / next steps

- **Done:** inspected both repos; read AGENTS.md and version-matched Next.js docs; finalized
  `users.ts` types; created server config, DB, validation, token/password utilities and user service.
- **Done (step 3):** middleware, auth/user routes, and corrected `index.js`; all routes mounted
  and syntax-checked.
- **Done (step 4):** public `/signin`, authenticated `(dashboard)` layout, role-specific views,
  `apiFetch` + token storage, Navbar/Footer links, Better Auth client fix. `tsc` + build pass.
- **Open / next steps:**
  1. Seed the first `manager` directly in MongoDB (`users` doc with hashed scrypt password);
     public registration is intentionally absent.
  2. Set all env vars in both `.env` files (see section 4), especially `INITIAL_REVIEW_SCORE`,
     `AUTH_SECRET`, `DB_URI`, and `NEXT_PUBLIC_API_URL`.
  3. Start `wamy-server` (`node index.js`) and `wamy-client` (`npm run dev`), then smoke-test:
     manager login -> create supervisor -> supervisor login -> create student -> student login.
  4. Replace the custom HMAC token in `wamy-server/utils/token.js` with a real JWT library when
     desired; routes/middleware need no changes. Wire Better Auth sessions to the same `users`
     collection when the unified-session work is scheduled.
  5. Add future collections (attendance, fees, leaves, documents) keyed by `studentId`.
