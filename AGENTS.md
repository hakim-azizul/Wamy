# WamyDorm — Project Context (single source of truth)

This is the **only** `AGENTS.md` in the workspace and documents BOTH repositories:
`wamy-client` (Next.js 16.4.6 App Router + TypeScript) and `wamy-server` (Node/Express +
native MongoDB driver). Keep it updated after every milestone. Do NOT create `wamy-server/AGENTS.md`.

**Client code rule:** before writing client code, read the version-matched guides in
`wamy-client/node_modules/next/dist/docs/`. `params`/`searchParams`/`cookies()` are async,
`middleware` is now `proxy`, interactive components need `"use client"`.

---

## 1. Architecture decisions (current, corrected)

### Single source of truth for accounts: Better Auth `user` (SINGULAR)
- Better Auth owns `user`, `account`, `session`, `verification` in MongoDB database **`WamyDorm`**.
- **There is no plural `users` collection.** `wamy-server/db.js` no longer exports
  `usersCollection()` and `ensureIndexes()` no longer creates an email index on `users`.
- Student detail collections link to `user._id` via `userId` (stored as ObjectId, exposed as
  hex string) — the same id Better Auth uses in `account.userId`.
- Passwords are hashed by Better Auth in `account.password` (`providerId: "credential"`).
  The old custom scrypt helper (`wamy-server/utils/password.js`) was removed.
- Login UI still posts to Express `/api/auth/login`, but Express now verifies credentials with
  **`verifyPassword` from `better-auth/crypto`** against Better Auth's `account` record.
- Managed account creation (manager -> supervisor, supervisor -> student) goes through
  **Better Auth's native sign-up** (`POST {clientAuthUrl}/api/auth/sign-up/email`), then app fields
  (`role`, `status`, `phone`, `createdBy`) are patched onto the same `user` doc. Student-only fields
  (`score`, `roomNumber`, `flatNumber`) are attached ONLY when `role === "student"`.

### Roles & permissions (3 roles)
| Role | May create | May view / edit | May delete |
|---|---|---|---|
| `manager` | only `supervisor` | all users; any student's CV; student `score`; PATCH any student detail; adjust scores; all score history | `supervisor` + `student` (never manager/self) |
| `supervisor` | only `student` (lightweight) | only students; any student's CV; PATCH any student detail; adjust scores; all score history | `student` only (never supervisor/manager/self) |
| `student` | nothing | only own account + own 5-section bundle (PUT); own score history only | nobody (403) |

`status` is `active | suspended` (default `active`); `createdBy` is the creator's **name**.
`score?`, `roomNumber?`, `flatNumber?` exist ONLY on student docs. Never require, send, validate,
or attach a score/room/flat for `manager` or `supervisor` anywhere (client or server).
Public sign-up UI is OFF.

### Cascading user deletion
`DELETE /api/users/:id` enforces the RBAC matrix above (403 forbidden, 404 missing target). On
success it deletes the Better Auth `user` document, all `account` and `session` records with that
`userId`, and — when the target was a student — all documents in the 5 modular student collections
with that `userId`. Client delete buttons call this endpoint ONLY after an RTL confirmation modal.

### Student CV page & office edits
- `عرض الملف` on student rows now **navigates** to `/dashboard/students/[userId]` (shared route for
  manager + supervisor), which renders the full CV/profile sheet: read-only `user` fields plus all
  5 modular detail sections via `StudentDetailsViewer`. The old inline viewer/modal was removed.
- `DashboardShell` role guard allows the shared `/dashboard/students/...` segment for office roles;
  students are redirected to `/dashboard`.
- Office roles can click `تعديل` on the CV page to open an RTL `StudentEditModal`: choose a detail
  category, edit pre-filled fields (read-only user fields stay non-editable), then PATCH. On success
  the CV updates in place and the modal closes.

### Student room / flat ownership
- The supervisor assigns `roomNumber` and `flatNumber` when creating a student account; they are
  stored on the Better Auth `user` document as the canonical source.
- `student_personal_info` no longer stores `flatNo`/`roomNo`. The modular student detail bundle
  (`GET /api/student-details/...`) includes a read-only `user` object `{ name, email, roomNumber,
  flatNumber }` fetched live from `userCollection()`; the student profile form and manager/
  supervisor detail viewers render email/room/flat as **read-only** fields.

### نظام النقاط (score system)
- Single collection **`score_transactions`**: `studentUserId`, `studentEmail`, `actorUserId`,
  `actorEmail`, `actorName`, `actorRole`, `delta` (non-zero integer), `previousScore`, `newScore`,
  `reason`, `violationSeverity`, `severityLabel`, `createdAt`. Index on
  `{ studentUserId: 1, createdAt: -1 }`. Deleted with the student in `deleteUserCascade()`.
- **Conditional severity rule:** `violationSeverity` (`simple`=بسيطة, `moderate`=متوسطة,
  `severe`=جسيمة) is REQUIRED only when `delta < 0`; for increases it is stripped and stored as
  `null` even if sent. Server rejects a decrease without a valid severity.
- `POST /api/scores` (manager/supervisor) atomically `$inc`s the student's `score` on the `user`
  document and inserts one transaction. `GET /api/scores` returns transactions newest-first:
  office roles see all (filter `?studentUserId=`/`?studentEmail=`), students see only their own.
- Client routes: `/dashboard/manager/scores`, `/dashboard/supervisor/scores` (student list with
  sorting + score adjustment form + history), `/dashboard/student/scores` (balance, bank-style
  history, roadmap). Students cannot adjust scores in the UI.
- Student CV page tabs: `التفاصيل` (profile + Edit modal) and `نظام النقاط` (score, adjust form,
  history, roadmap).
- Color coding: increases=soft green; decreases `بسيطة`=amber/yellow, `متوسطة`=warm orange,
  `جسيمة`=soft red; severity badge shown on decreases only.
- Roadmap ladder: نجم السكن 200+ / قائد 150–200 / نشيط 100–150 / مبتدئ 100 / كسول 70–100 /
  سيئ 60–70 / تعويض +50 / خطأ جسيم 40–50 / خارج السكن <40; shows points remaining to 150 and 200.

### Five modular student detail collections (unique `userId` index each)
`student_personal_info` (`personal`), `student_academic_info` (`academic`),
`student_skills_talents` (`skills`), `student_achievements` (`achievements`),
`student_additional_info` (`additional`). Common fields: `_id`, `userId`, `isCompleted`,
`createdAt`, `updatedAt`. Passport normalized `.trim().toLowerCase()` server-side.

---

## 2. File inventory

### Server (wamy-server)
- `config.js` — `DB_URI`, `DB_NAME` (default **`WamyDorm`** to match client), `PORT` (5000),
  `INITIAL_REVIEW_SCORE` (100), `AUTH_SECRET`, `clientOrigins` (array: localhost + 127.0.0.1:3000
  plus comma-separated `CLIENT_ORIGIN`), `clientAuthUrl` (`CLIENT_URL` /
  `NEXT_PUBLIC_BETTER_AUTH_URL`, default `http://localhost:3000`).
- `db.js` — `connectToMongoDB()`, `getDb()`, **`userCollection()` (`"user"`)**,
  **`accountCollection()` (`"account"`)**, **`sessionCollection()` (`"session"`)**,
  `STUDENT_DETAIL_COLLECTIONS`, `SECTION_KEYS`, `studentDetailsCollection()`,
  `ensureIndexes()` (student detail `userId` indexes only), `closeMongoDB()`.
- `services/users.js` — reads `user`/`account`; `findCredentialByUserId()`; `createUser()` calls
  Better Auth sign-up then patches app fields; attaches `score`/`roomNumber`/`flatNumber` ONLY for
  students; `listUsers()`, `updateStudentScore()`; **`deleteUserCascade()`** removes `user` +
  `account` + `session` + (for students) all 5 detail collections by `userId`.
- `routes/auth.js` — login verifies via `better-auth/crypto` `verifyPassword()` against
  `account.password`; issues the existing isolated HMAC bearer token.
- `middleware.js` — `verifyUser`, `isManager`, `isSupervisor`, `isStudent`,
  `isManagerOrSupervisor` (office-only guard for CV PATCH and score changes).
- `db.js` — adds `scoreTransactionsCollection()` + `{studentUserId, createdAt}` index.
- `utils/scoreValidation.js` — **created**: `validateScoreChange()` (non-zero integer delta,
  required reason, conditional severity, strip on increase), `buildTransactionFilter()`,
  `VIOLATION_SEVERITIES`/labels.
- `services/scores.js` — **created**: atomic `adjustStudentScore()` ($inc + insert transaction),
  `listScoreTransactions()` (newest-first), `deleteScoreTransactionsForStudent()`.
- `routes/scores.js` — **created**: `POST /api/scores` + `GET /api/scores` (role-scoped).
- `index.js` — mounts `/api/scores`.
- `services/users.js` — cascade deletion now also removes the student's score transactions.
- `routes/users.js` — `POST /students` validates required `roomNumber`/`flatNumber`;
  `PATCH /:id/score` rejects non-student targets with 400; **`DELETE /:id`** enforces the deletion
  RBAC (self-delete 403, student actor 403, missing 404, disallowed role 403) then cascades.
- `routes/studentDetails.js` — adds **`PATCH /:userId/details`** (`verifyUser` +
  `isManagerOrSupervisor`, 404 missing student, returns updated bundle + section).
- `services/studentDetails.js` — bundle includes canonical `user` fields; adds
  `patchStudentSection()` (partial `$set`, `null` clears, untouched fields preserved, upsert-safe).
- `utils/studentDetailsValidation.js` — adds `validatePartialSection()` (only supplied keys
  validated; rejects unknown keys and canonical user fields email/name/roomNumber/flatNumber).
- `utils/validation.js`, `utils/token.js`.
- `index.js` — cleaned up config import ordering (no behavior change).
- `seed-manager.mjs` — drops any legacy `users` collection, creates the manager through Better
  Auth's native sign-up if missing, sets `role: "manager"`/`status: "active"` on the `user` doc,
  verifies credentials with Better Auth, and reports success.
- `index.js` — CORS callback reflects any allowed local origin (localhost + 127.0.0.1:3000 and
  `CLIENT_ORIGIN` list), sends `Access-Control-Allow-Private-Network`, 403 for disallowed origins.
- `package.json` — added dependency **`better-auth@1.7.27`** and `start`/`dev`/`seed` scripts.
- `.env` — corrected `PORT` from the invalid `http://localhost:5000` to `5000`.
- Removed: `utils/password.js` (obsolete custom scrypt hash/verify).

### Client (wamy-client)
- `src/lib/auth.ts` — Better Auth Mongo adapter now uses `client.db(process.env.DB_NAME || "WamyDorm")`.
- `src/lib/auth-client.ts`, `src/app/api/auth/[...all]/route.ts` — unchanged Better Auth client/handler.
- `src/lib/api/api-client.ts` — token storage + `apiFetch<T>()` using `NEXT_PUBLIC_API_URL`
  (default `http://localhost:5000`); `SignInForm` calls Express `/api/auth/login` (custom route),
  stores the bearer token, and shows a clear "server not reachable" hint on network errors.
- `src/lib/types/users.ts` — added student-only `roomNumber?`/`flatNumber?`.
- `src/lib/types/scores.ts` — **created**: `ScoreTransaction`, `ViolationSeverity`.
- `src/lib/scoreSystem.ts` — **created**: severity labels/options, color tone helpers,
  `SCORE_LADDER`, `currentStatus()`, `pointsToNextMilestone()`.
- `src/lib/types/studentDetails.ts` — removed `flatNo`/`roomNo` from personal info; added
  `StudentAccountFields` and `StudentFullDetailsBundle.user`.
- `src/lib/studentDetailsMeta.ts` — removed editable flat/room fields from the personal section.
- `src/lib/useAuthStatus.ts` — **created**: lightweight navbar/footer auth state via the stored
  token and `GET /api/auth/me` (exposes `checking`, `isAuthenticated`, `role`).
- `src/lib/deletePermissions.ts` — **created**: `canDeleteUser(actorRole, target)` mirrors server
  deletion RBAC so buttons appear only for authorized rows.
- `shared/ConfirmDeleteModal.tsx` — **created**: RTL confirmation dialog (name/email/role,
  "تأكيد الحذف" + "إلغاء", busy/disabled state, inline error, Escape-to-cancel). No API call on
  button click — only after Confirm.
- `shared/useUserDeletion.ts` — **created**: shared modal state + confirmed `DELETE` call + error
  feedback + removal callback.
- `src/lib/labels.ts`, `src/lib/format.ts`.
- `src/lib/dashboardNav.ts` — single source of truth for the role -> route map (icons from
  `lucide-react`), including the five student detail sections as query-param deep links.
- `src/Componenets/(dashboard)/shared/DashboardSidebar.tsx` — **responsive sidebar**: RTL fixed
  desktop rail (collapsible via chevron), mobile drawer + overlay (hamburger in header), active
  route highlighting with `usePathname()`/`useSearchParams()` (longest-href match so `/new`
  doesn't also highlight its parent), role badge + user name + logout in the footer.
- `DashboardShell.tsx` — refactored to render `DashboardSidebar` (inside `Suspense`), owns collapse
  and mobile-drawer state, keeps the role guard, header now shows a mobile menu button + user badge.
- `student/ProfileForm.tsx` — supports `?section=<key>` deep links from the sidebar; renders
  email/room/flat from `bundle.user` as read-only fields (`ReadOnlyField`) in personal/academic.
- `shared/FormFields.tsx` — added `ReadOnlyField` for canonical user fields.
- `shared/StudentDetailsViewer.tsx` — shows a read-only "بيانات الحساب" card from `bundle.user`.
- `shared/StudentDirectory.tsx` — lists room/flat columns from the canonical user records.
- `supervisor/CreateStudentForm.tsx` — required Room Number + Flat Number inputs; sends
  `roomNumber`/`flatNumber` in the student creation payload; no score input.
- `manager/UsersView.tsx` + `shared/UsersTable.tsx` — score editor only rendered/allowed for
  `role === "student"` rows; Delete action column shown via `actorRole`/`onRequestDelete` and
  gated by `canDeleteUser` (manager never sees Delete on manager rows).
- `manager/SupervisorsView.tsx` — Delete action on supervisor rows with confirmation modal.
- `shared/StudentDirectory.tsx` — `عرض الملف` is now a `Link` to `/dashboard/students/<id>`;
  Delete action retained for manager/supervisor with the same modal; used by
  `manager/StudentsView.tsx` and `supervisor/StudentsView.tsx`.
- `shared/StudentCvPage.tsx` — **created**: client CV page fetching `GET /api/student-details/:id`,
  header with student name/email, completion, `تعديل` button (office roles only), error/loading.
- `shared/StudentEditModal.tsx` — **created**: RTL modal with category selector for the 5 sections,
  pre-filled fields per selected category, read-only canonical user fields, PATCH submit, busy/error
  states, closes and refreshes CV on success.
- `src/app/(dashboard)/dashboard/students/[userId]/page.tsx` — **created**: dedicated CV route.
- Score components (`shared/`): `ScoreAdjustForm.tsx` (direction toggle, conditional severity
  dropdown only for decreases), `ScoreHistory.tsx` (bank-style color-coded rows),
  `ScoreRoadmap.tsx` (ladder + points to 150/200), `StudentScorePanel.tsx` (CV score tab),
  `ScoreManagementView.tsx` (office list + sorting + adjustment).
- `student/StudentScoreView.tsx` — **created**: student balance/history/roadmap page.
- Routes: `dashboard/manager/scores/page.tsx`, `dashboard/supervisor/scores/page.tsx`,
  `dashboard/student/scores/page.tsx`.
- `lib/dashboardNav.ts` — `نظام النقاط` added for all three roles.
- `StudentCvPage.tsx` — now has `التفاصيل` / `نظام النقاط` tabs with the score panel.
- `student/StudentOverview.tsx` — score card links to `/dashboard/student/scores`.
- `shared/DashboardShell.tsx` — role guard updated to permit `/dashboard/students/...` for manager
  and supervisor only.
- `(root)/shared/Navbar.tsx` + `Footer.tsx` — when authenticated the "دخول الأعضاء" CTA becomes
  a "لوحة التحكم" button linking to `/dashboard`; logged-out state unchanged.
- `src/app/(dashboard)/dashboard/student/profile/page.tsx` — wraps `ProfileForm` in `Suspense`
  (required for `useSearchParams()`).
- Dashboard routes/views otherwise unchanged.

### Sidebar role -> route mapping
- **Shared:** `/dashboard` (overview) for all roles.
- **manager:** `/dashboard/manager/supervisors`, `/dashboard/manager/users`,
  `/dashboard/manager/students`.
- **supervisor:** `/dashboard/supervisor/students`, `/dashboard/supervisor/students/new`.
- **student:** `/dashboard/student/overview`, `/dashboard/student/profile`, plus five children of
  the profile route: `?section=personal|academic|skills|achievements|additional`.
- "العودة للموقع" (`/`) is shown to every role; logout lives in the sidebar footer.

---

## 3. API

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | public | Health check |
| POST | `/api/auth/login` | public | Express login; Better Auth credential verification; returns `{ token, user }` |
| GET | `/api/auth/me` | auth | current safe user from `user` collection |
| POST | `/api/users/supervisors` | manager | native Better Auth sign-up + role patch |
| POST | `/api/users/students` | supervisor | native sign-up + student-only patch (`score`, `roomNumber`, `flatNumber`, createdBy) |
| GET | `/api/users` | auth | manager → all, supervisor → students, student → self |
| PATCH | `/api/users/:id/score` | manager | edit student top-level `score`; 400 for non-student targets |
| DELETE | `/api/users/:id` | manager / supervisor (RBAC matrix) | cascading delete: user + account + session + student details |
| GET | `/api/student-details/me` | student | own 5-section bundle + completionSummary + read-only `user` fields |
| GET | `/api/student-details/:userId` | manager/supervisor (student: self only) | any student's bundle + read-only `user` fields |
| PUT | `/api/student-details/:section` | student | upsert own section |
| PATCH | `/api/student-details/:userId/details` | manager / supervisor | partial edit `{ section, fields }`; `null` clears, omitted keys preserved; canonical user fields rejected; returns bundle + section |
| POST | `/api/scores` | manager / supervisor | `{ studentUserId, delta, reason, violationSeverity? }`; atomic score update + transaction |
| GET | `/api/scores` | all roles | newest-first transactions; office: all (filter by student id/email), student: own only |

---

## 4. Environment variables

**Server `.env`:** `DB_URI` (required), `DB_NAME` **`WamyDorm`** (must match client),
`PORT=5000` (a bare port number — NOT a URL), `INITIAL_REVIEW_SCORE?`, `AUTH_SECRET`,
`CLIENT_ORIGIN?` (comma-separated extra browser origins, e.g. LAN IP),
`CLIENT_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL` (client auth origin for native sign-up).
**Client `.env`:** `DB_URI`, `DB_NAME` (default WamyDorm), `BETTER_AUTH_SECRET`,
`NEXT_PUBLIC_API_URL` (default `http://localhost:5000`), `NEXT_PUBLIC_BETTER_AUTH_URL`.
Never commit real values.

---

## 5. Root causes found & fixes

1. **Duplicate `users` collection** — `db.js` had `usersCollection()` pointing to `"users"` and
   `ensureIndexes()` created a unique email index there, which materialized the empty collection
   on every server start. Fixed by switching all server reads/writes to Better Auth's singular
   `user` collection and removing that index; a legacy `users` collection is dropped by the seed
   script.
2. **"Invalid email or password"** — the UI called Express `/api/auth/login`, which looked up the
   manager in `users` (empty) and compared a custom `scrypt$...` hash with the password. The seeded
   manager actually lives in `user` with a Better Auth hash in `account.password`. Fixed by looking
   up `user` + `account` and verifying with Better Auth's own `verifyPassword()`; also made all
   managed account creation use Better Auth sign-up so hashes stay compatible going forward.
3. **"Failed to fetch"** — the browser never got a usable response from the API. Contributing causes:
   (a) the Express server was not running (no listener on port 5000); (b) `server/.env` contained
   the invalid `PORT=http://localhost:5000` (masked only by the numeric fallback); (c) CORS allowed
   only the exact string `http://localhost:3000`, so a client opened at `http://127.0.0.1:3000`
   (or any other host) was rejected by the browser even though the API replied 200. Fixed by
   correcting `PORT`, allowing both loopback origins plus configurable extra origins, sending the
   Private-Network preflight header, adding `npm start`, and a clearer UI network-error message.

## 6. Verification performed
- `node --check` all server files; `npx tsc --noEmit`; `npm run build` — all pass.
- `node seed-manager.mjs` — legacy `users` dropped; manager present in `user` with credential
  verified. DB collections after server start: `account, session, student_*, user, verification`
  (no `users`).
- Live HTTP: `GET /` healthy; `POST /api/auth/login` with `manager@wamy.org` / `Manager@1234`
  returned a token and `{ role: "manager", status: "active" }`; wrong password → 401;
  `GET /api/auth/me` and `GET /api/users` with the token succeeded.
- Native sign-up path: manager created a test supervisor via `POST /api/users/supervisors`; that
  account logged in successfully; test records were then removed.
- CORS check after fix: login from origins `http://localhost:3000` and `http://127.0.0.1:3000`
  both returned 200 with a matching `Access-Control-Allow-Origin`; an unknown LAN origin was 403.
  `npx tsc --noEmit` and `npm run build` still pass.
- Sidebar milestone: `npx tsc --noEmit` and `npm run build` pass; all 11 routes still generated
  (no new routes — the five student sections are deep links into `/dashboard/student/profile`).
- Previous milestone: server syntax check + clean restart pass; login returns a manager with NO score
  field; `PATCH /api/users/<manager-id>/score` → 400 "Score applies only to student accounts.";
  `GET /api/users` works; `npx tsc --noEmit` and `npm run build` pass.
- Delete milestone: `node --check` all server files; `npx tsc --noEmit`; `npm run build` pass.
  Live RBAC verification (all matched expectations): manager→self 403, manager→missing 404,
  manager→supervisor 200, manager→student 200, supervisor→self 403, supervisor→manager 403,
  supervisor→supervisor 403, supervisor→student 200, student→manager 403. Cascade verified:
  deleted student's `student_personal_info` and `account` counts both 0. Test accounts removed.
- CV/PATCH milestone: `node --check` all server files; server restart healthy; `npx tsc --noEmit`;
  `npm run build` pass (route list now includes `ƒ /dashboard/students/[userId]`). Live PATCH test:
  manager partial edit → 200 with changed field `بعد التعديل`, cleared field `null`, bundle returned;
  protected `email` field → 400; unknown field → 400; original values restored afterwards.
- Score milestone: `node --check` all server files; server restart healthy; `npx tsc --noEmit`;
  `npm run build` pass (16 routes incl. manager/supervisor/student scores). Live API test: decrease
  without severity → 400; invalid severity → 400; increase with severity sent → 201 and stored
  severity `null`; decrease with `moderate` → 201 and stored correctly; score chain 100→110→107;
  manager list → newest-first (`-3` first); score restored to 100 and test rows removed.

## 7. Next steps
- Run both servers: `npm run dev` in `wamy-client` and `npm start` in `wamy-server`.
- Keep `DB_NAME` identical in both `.env` files; never reintroduce a plural `users` helper.
- If opening the client from a LAN IP / other hostname, add that exact origin to `CLIENT_ORIGIN`
  on the server and set `NEXT_PUBLIC_API_URL` to the reachable API host.
- Optional: move Express auth fully onto Better Auth sessions; current bearer token is isolated in
  `utils/token.js` so this can be swapped without route changes.
