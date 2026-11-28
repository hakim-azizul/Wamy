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
- **JWT auth flow:** the UI signs in through Better Auth (`/api/auth/sign-in/email`), then gets a
  signed JWT from `/api/auth/token` (JWT plugin). `apiFetch` sends it as `Authorization: Bearer
  <token>` to wamy-server, which verifies it with `jose` against Better Auth's `/api/auth/jwks`.
  No HMAC secret or token issuer exists on wamy-server; `POST /api/auth/login` there returns 410.
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
- **Reason limit:** `reason` is required and capped at **70 characters** everywhere
  (`SCORE_REASON_MAX_LENGTH` shared client/server). Client textareas use `maxLength={70}` with a
  live `0 / 70` counter and validation feedback; `validateScoreChange()` rejects longer reasons.
- `POST /api/scores` (manager/supervisor) atomically `$inc`s the student's `score` on the `user`
  document and inserts one transaction. `GET /api/scores` returns transactions newest-first:
  office roles see all (filter `?studentUserId=`/`?studentEmail=`), students see only their own.
- **Manager-only modifier privacy:** `toClientTransaction(doc, includeActor)` returns
  `actorUserId`/`actorEmail`/`actorName`/`actorRole` **only** when the authenticated caller's role
  is `manager` (checked from `req.user.role`, the authoritative DB user). Supervisors and students
  receive transactions with all actor identity fields omitted; score, delta, severity, reason and
  timestamp are unchanged. Applied to both `GET /api/scores` and the `POST` response.
- Client routes: `/dashboard/manager/scores`, `/dashboard/supervisor/scores` (**compact student
  card list only** — no meter/history sections on the list page), shared
  `/dashboard/points/[studentId]` (one student's unified meter + history for office roles, plus a
  **«تقييم» two-tab evaluation modal** for managers/supervisors),
  `/dashboard/student/scores` (own unified card + history). Students cannot adjust scores in the UI.
- **URL-driven sorting** on the office list: `?sort=score-desc|score-asc|name|room|flat|nationality`
  read via `useSearchParams()` and updated with `useRouter().replace(pathname + query, { scroll:
  false })` so it survives reloads and back/forward; `score-desc` is the default (no query param).
  Both list pages wrap `ScoreManagementView` in `<Suspense>` (required for `useSearchParams`).
- Student CV page tabs: `التفاصيل` (profile + Edit modal) and `نظام النقاط` (unified card, adjust
  form, history).
- **Unified Score & Evaluation Scale Card** (`shared/ScoreMilestoneCard.tsx`): one light
  glassmorphism RTL card with current score, current status badge, a **single next-positive-station
  card** (never both counters at once), plus a **diverging horizontal scale** centered on
  «مبتدئ» = 100.
- **Dynamic single next-stoppage card:** `nextPositiveStation(score)` is derived from the live score
  on every render/refresh (increases and decreases), so it never stays stale:
  - `< 100` → recovery to «مبتدئ» (100), remaining `100 - score`, "100 — العودة إلى نقطة التوازن",
    styled with an amber recovery theme.
  - `100–149` → «قائد» (150), remaining `150 - score`.
  - `150–199` → «نجم السكن» (200+), remaining `200 - score`.
  - `>= 200` → concise top-tier achieved state (no negative counter).
  Placed directly above `سجل النقاط` on the student route, CV score tab, and office scores view.
  Replaced the old vertical `ScoreRoadmap.tsx` and the earlier checklist-style strip.
- **Diverging scale behavior:** مبتدئ (100) is the neutral midpoint of a **single continuous rail**
  colored across its whole length: red → warm orange → amber on the left, neutral sand at the
  center, then **gradually** soft green → medium green → deep green on the right. Penalty stations
  are LEFT of center and are **never** marked completed/checked; achievement stations are RIGHT and
  show a check when reached.
- **Continuous palette:** `scoreZoneColor()` / `ZONE_STOPS` in `scoreSystem.ts` linearly mixes
  colors between anchor scores (20, 45, 65, 85, 100, 125, 150, 175, 200) so the rail, every
  station dot and the current pointer always use harmonized, smoothly graduating colors.
- **Smart pointer:** `scoreScalePosition()` interpolates between station anchors, so 125 (between
  مبتدئ and نشيط) and 85 (between كسول and مبتدئ) land accurately. The small zone-colored pointer
  plus a light pill shows the current band/score; when the score lands exactly on a station the
  station node is deliberately softened (`soften`) so the anchor is not rendered as a heavy double
  dot. Edge labels (`خارج السكن`, `نجم السكن`) stay unclipped via scale-viewport padding.
- Station order (ascending, anchors): خارج السكن <40 (20) / خطأ جسيم 40–50 (45) / تعويض +50 (55) /
  سيئ 60–70 (65) / كسول 70–100 (85) / **مبتدئ 100 (100 = center)** / نشيط 100–150 (125) /
  قائد 150–200 (175) / نجم السكن 200+ (200).
- Color coding: increases=soft green; decreases `بسيطة`=amber/yellow, `متوسطة`=warm orange,
  `جسيمة`=soft red; severity badge shown on decreases only. `سجل النقاط` keeps newest-to-oldest order.
- `ScoreHistory` takes `showActor` (default `false`); the modifier name renders inline
  **only for managers** (`/dashboard/points/[studentId]`, CV score tab when actor is manager).
  Supervisors and students never render the attribution block/label.
- **Compact bank-style rows:** each transaction is a **single horizontal line** (`flex
  items-center justify-between`, `flex-nowrap`, `whitespace-nowrap`, `truncate` on the reason) with
  minimal `py-1.5` height and tight gaps: direction icon + truncated reason + manager-only modifier
  + inline severity badge (`بسيطة`/`متوسطة`/`جسيمة`) + inline `DD/MM/YYYY` date, and on the right
  the delta (`+5`/`-10`) grouped with the `100 → 105` balance transition. Less-essential inline
  metadata (modifier, date) hides on narrower screens instead of wrapping into tall stacked blocks.
  All compact metadata (direction icon, manager-only modifier, severity badge, date, delta/balance)
  uses `shrink-0`; the reason alone truncates, so negative (`خصم`) logs with a severity badge still
  fit on one line. Newest-to-oldest order and severity color coding are unchanged.

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
- `routes/auth.js` — `GET /me` only; `POST /login` returns 410 (tokens come from Better Auth).
- `middleware.js` — `verifyUser` **awaits `verifyToken()`**, attaches `req.claims`/`req.userId`/
  `req.user` from the DB; 401 on missing/invalid/expired JWT. Also `isManager`, `isSupervisor`,
  `isStudent`, `isManagerOrSupervisor`.
- `db.js` — adds `scoreTransactionsCollection()` + `{studentUserId, createdAt}` index.
- `utils/scoreValidation.js` — **created**: `validateScoreChange()` (non-zero integer delta,
  required reason ≤70 chars, conditional severity, strip on increase), `buildTransactionFilter()`,
  `VIOLATION_SEVERITIES`/labels.
- `services/scores.js` — **created**: atomic `adjustStudentScore()` ($inc + insert transaction),
  `listScoreTransactions()` (newest-first), `deleteScoreTransactionsForStudent()`, plus role-aware
  `toClientTransaction()` that strips modifier identity for non-managers.
- `routes/scores.js` — passes `req.user.role === "manager"` into both list and adjust responses.
- `routes/scores.js` — **created**: `POST /api/scores` + `GET /api/scores` (role-scoped).
- `index.js` — mounts `/api/scores`.
- `services/users.js` — cascade deletion now also removes the student's score transactions.
- `routes/users.js` — `GET /` supports `?role=` filtering within the caller's scope;
  `POST /students` validates required `roomNumber`/`flatNumber`;
  `PATCH /:id/score` rejects non-student targets with 400; **`DELETE /:id`** enforces the deletion
  RBAC (self-delete 403, student actor 403, missing 404, disallowed role 403) then cascades.
- `routes/studentDetails.js` — adds **`PATCH /:userId/details`** (`verifyUser` +
  `isManagerOrSupervisor`, 404 missing student, returns updated bundle + section).
- `services/studentDetails.js` — bundle includes canonical `user` fields; adds
  `patchStudentSection()` (partial `$set`, `null` clears, untouched fields preserved, upsert-safe).
- `utils/studentDetailsValidation.js` — adds `validatePartialSection()` (only supplied keys
  validated; rejects unknown keys and canonical user fields email/name/roomNumber/flatNumber).
- `utils/validation.js`.
- **`utils/tokens.js`** — **created** (replaces removed `utils/token.js`): `verifyToken()` uses
  `jose` `createRemoteJWKSet(new URL(`${clientAuthUrl}/api/auth/jwks`))` + `jwtVerify()` with
  issuer/audience from the client baseURL. No local secret and no token issuer.
- **`package.json`** — added `jose` dependency.
- `config.js` — removed `authSecret`/`AUTH_SECRET` entirely; logs the JWKS endpoint and that
  AUTH_SECRET is not used on the server.
- `index.js` — cleaned up config import ordering (no behavior change).
- `seed-manager.mjs` — drops any legacy `users` collection, creates the manager through Better
  Auth's native sign-up if missing, sets `role: "manager"`/`status: "active"` on the `user` doc,
  verifies credentials with Better Auth, and reports success.
- `index.js` — **CORS runs before `express.json()` and all routes** (so OPTIONS preflights get full
  headers). Explicit `methods` (GET/POST/PUT/PATCH/DELETE/OPTIONS), `allowedHeaders`
  (Content-Type, Authorization, X-Access-Token), `credentials`, `optionsSuccessStatus: 204`,
  `maxAge: 600`; blocked origins are logged with the exact value to add to `CLIENT_ORIGIN`.
  Actual error responses (e.g. 401) also carry `Access-Control-Allow-Origin`.
- `package.json` — added dependency **`better-auth@1.7.27`** and `start`/`dev`/`seed` scripts.
- `.env` — corrected `PORT` from the invalid `http://localhost:5000` to `5000`.
- Removed: `utils/password.js` (obsolete scrypt hash), `utils/token.js` (obsolete HMAC issuer).

### Client (wamy-client)
- **Global views:** `src/app/loading.tsx` — centered RTL loading screen with an animated,
  staggered-draw `W` mark (`Componenets/(root)/shared/WMark.tsx`) in the cream/forest palette;
  `src/app/not-found.tsx` — warm hostel-themed RTL 404 card with `404` indicator and Home /
  Dashboard / Sign-in links. `src/app/globals.css` holds `wam-draw`/`wam-float`/`wam-breathe`
  keyframes with a `prefers-reduced-motion: reduce` fallback. These are global app files and do not
  alter `(root)` or `(dashboard)` layouts.
- `src/lib/auth.ts` — Better Auth Mongo adapter + **`jwt()` plugin** exposing `/api/auth/token`
  and `/api/auth/jwks`; sets `baseURL`, `trustedOrigins`, JWT `issuer`/`audience`=baseURL,
  `expirationTime: "1h"`.
- `src/lib/auth-client.ts` — **`jwtClient()` plugin**, `fetchAuthJwt()` (`$fetch("/token")`),
  `jwtExpiry()` helper; exports `authClient`, `signIn`, `signUp`, `useSession`.
- `src/lib/api/api-client.ts` — `getBearerToken()` refreshes the JWT from Better Auth when the
  cached one is missing/near expiry; `apiFetch` always sends `Authorization: Bearer <token>`.
- `src/Componenets/(root)/shared/SignInForm.tsx` — signs in via `authClient.signIn.email()`,
  fetches the JWT and stores it before navigating to `/dashboard`.
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
- `DashboardShell.tsx` — renders `DashboardSidebar` (inside `Suspense`), owns collapse/mobile state,
  keeps role guard, and now **surfaces auth/network/CORS failures** in an RTL error card with
  Retry / Login actions instead of silently redirecting.
- `(root)/shared/Navbar.tsx` + `Footer.tsx` — logo src corrected to `/Logo.png`.
- `(root)/Home/welcomeMsg.tsx` — missing jpegs replaced with existing `/hero-building.jpeg`.
- **Homepage section styling convention:** no horizontal dividers/borders between landing sections —
  removed `border-b` from Hero, About/welcome and Facilities `<section>` roots, and the internal
  `border-t` above the director note in About. Vertical `py-*` spacing is preserved so sections flow
  cleanly; decorative card borders inside sections remain. Navbar `border-b`/mobile-menu `border-t`
  and Footer `border-t` (outer + copyright bar) are intentionally unchanged.
- `student/ProfileForm.tsx` — supports `?section=<key>` deep links from the sidebar; renders
  email/room/flat from `bundle.user` as read-only fields (`ReadOnlyField`) in personal/academic.
- `shared/FormFields.tsx` — added `ReadOnlyField` for canonical user fields.
- `shared/StudentDetailsViewer.tsx` — shows a read-only "بيانات الحساب" card from `bundle.user`.
- `shared/StudentDirectory.tsx` — lists room/flat columns from the canonical user records.
- `supervisor/CreateStudentForm.tsx` — required Room Number + Flat Number inputs; sends
  `roomNumber`/`flatNumber` in the student creation payload; no score input.
- `manager/UsersView.tsx` + `shared/UsersTable.tsx` — **الدرجة column removed entirely** (and the
  old inline score editor); Delete action column shown via `actorRole`/`onRequestDelete` and gated
  by `canDeleteUser` (manager never sees Delete on manager rows).
- **Role sorting on كل المستخدمين:** `UsersView` reads `?role=all|manager|supervisor|student` via
  `useSearchParams()` and updates it with `useRouter().replace(pathname + query, { scroll: false })`,
  so it persists across reloads/back-forward. The selected role is sent to the backend as
  `GET /api/users?role=<role>`; the server applies it inside the caller's role scope (supervisors
  stay limited to students). The page wraps `UsersView` in `<Suspense>`.
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
  **`ScoreMilestoneCard.tsx`** (unified score + status + remaining badges + horizontal strip;
  replaced removed `ScoreRoadmap.tsx`), `StudentScorePanel.tsx` (CV score tab),
  `ScoreManagementView.tsx` (office compact card list + URL sorting, no lower meter/history),
  `StudentPointsDetailView.tsx` (office points detail page with «تقييم» button + instant refresh),
  `ScoreEvaluationModal.tsx` (**created**: RTL light-theme modal with `زيادة` / `خصم` tabs,
  positive amount + reason for increases, conditional `بسيطة`/`متوسطة`/`جسيمة` severity for
  decreases, submit via `POST /api/scores`, busy/error feedback, Escape/close).
- On successful evaluation the detail view updates the student's score from the API response and
  silently refetches `/api/users` + `/api/scores?studentUserId=...`, so the diverging meter pointer
  and newest-to-oldest `سجل النقاط` refresh without a page reload.
- `src/app/(dashboard)/dashboard/points/[studentId]/page.tsx` — **created**: shared office points
  detail route; manager/supervisor scores pages wrap the list in `Suspense`.
- `DashboardShell.tsx` — role guard now also permits `/dashboard/points/...` for office roles.
- `src/lib/scoreSystem.ts` — `SCORE_SCALE_STATIONS` (offset + score anchor + side), continuous
  `ZONE_STOPS`/`scoreZoneColor()` (with `mixHex()`), `positiveStationColor()` /
  `negativeStationColor()` delegates, `scoreScalePosition()` interpolation, `nextPositiveStation()`
  for the single target card; `currentStatus()` distinguishes تعويض/خطأ جسيم bands.
  Replaced `MILESTONE_TRACK`.
- `student/StudentScoreView.tsx` — student page: unified card above `سجل النقاط`.
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
| POST | `/api/auth/login` | public | **deprecated — 410**; sign in via Better Auth `/api/auth/sign-in/email` |
| GET | `/api/auth/me` | Bearer JWT | current safe user; JWT verified via Better Auth JWKS |
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

**Server Vercel project env (exact names):**
- `DB_URI` (required) — MongoDB connection string.
- `DB_NAME` — **must equal `WamyDorm`** on both projects.
- `INITIAL_REVIEW_SCORE` (optional, default 100).
- `CLIENT_ORIGIN` — **required**: `https://wamy-gray.vercel.app` (comma-separated if several).
  This is what CORS allows, and it also serves as the fallback JWKS/sign-up origin.
- `CLIENT_URL` (or `BETTER_AUTH_URL` / `NEXT_PUBLIC_BETTER_AUTH_URL`) — same deployed client URL;
  used to find `/api/auth/jwks` for JWT verification AND server-side Better Auth sign-up.
  Setting **only `CLIENT_ORIGIN=https://wamy-gray.vercel.app`** is sufficient for both CORS and JWKS.
- **No `AUTH_SECRET` on wamy-server** — tokens are verified with Better Auth's public JWKS keys.
- `PORT=5000` is for **local only**; Vercel serverless ignores it (`isVercel` skips `app.listen`).

**Client Vercel project env (exact names):**
- `NEXT_PUBLIC_API_URL` — **required in production**: deployed wamy-server URL, e.g.
  `https://wamy-server.vercel.app`. No localhost fallback in production; `NEXT_PUBLIC_*`
  is inlined at BUILD time, so a new value requires a **fresh Redeploy**.
- `NEXT_PUBLIC_BETTER_AUTH_URL` (optional) — deployed client URL if Better Auth needs an explicit
  base URL; otherwise same-origin `/api/auth` is used.
- `DB_URI` — MongoDB URI for the Better Auth route handler (`src/lib/auth.ts`).
- `DB_NAME` — `WamyDorm`.
- `BETTER_AUTH_SECRET` — secret used by Better Auth **on the client project only** (JWT signing keys
  are generated/stored in MongoDB by the JWT plugin).
- `BETTER_AUTH_URL` — deployed client URL; becomes JWT `iss`/`aud` and Better Auth `baseURL`
  (must match `CLIENT_URL` on wamy-server).
Never commit real values. Always **Redeploy** after any Vercel env change.

### Deployment diagnostics (added)
- Client `getApiBaseUrl()` validates `NEXT_PUBLIC_API_URL` as absolute http(s); in production a
  missing/invalid value throws a clear error naming the variable instead of silently using
  `http://localhost:5000`; network failures now report the resolved base URL.
- Server `config.js` exposes `logConfigDiagnostics()` (called at startup) printing environment,
  DB name, allowed CORS origins and client auth URL, plus explicit `console.error` warnings for
  missing `DB_URI`, empty production CORS origins, and localhost client auth URL in production.
  Logs the resolved JWKS endpoint and confirms AUTH_SECRET is unused on the server. No secrets logged.
- Server CORS accepts `CLIENT_ORIGIN`, `CLIENT_ORIGINS`, `CLIENT_URL`, `NEXT_PUBLIC_BETTER_AUTH_URL`,
  `BETTER_AUTH_URL`; dev-only localhost origins are omitted in production. Blocked origins are
  logged with the exact value to add. Preflight returns 204 with
  `Access-Control-Allow-Origin`, `Access-Control-Allow-Headers: Content-Type, Authorization, X-Access-Token`,
  and `Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS` — also on error responses.
  Verified locally with origin `https://wamy-gray.vercel.app` (204 allowed, unknown origin 403).
- Logo asset: `public/Logo.png` is the real filename (capital L); Navbar/Footer now reference
  `/Logo.png` (the previous lowercase `/logo.png` 404'd on Linux/Vercel and made
  `/_next/image` return 400). Missing welcome-section jpegs now use the existing
  `/hero-building.jpeg`.
- `auth.ts` sets `baseURL`/`trustedOrigins` and JWT plugin `issuer`/`audience`; `auth-client.ts`
  uses only the public URL plus `jwtClient()`.
- JWT flow (verified locally): `/api/auth/jwks` → 200 with keys; Better Auth sign-in → 200 with
  cookie; `/api/auth/token` → 200 with JWT; Express `/api/auth/me` with that JWT → 200 (manager);
  bogus token → 401; missing token → 401.
- CORS fix verification: with `CLIENT_ORIGIN=https://wamy-gray.vercel.app`, OPTIONS
  `/api/auth/me` → 204 with matching ACAO and full allow-headers/methods; unknown origin → 403;
  a 401 response still carries `Access-Control-Allow-Origin`. `node --check`, `npx tsc --noEmit`,
  `npm run build` all pass.

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
- Points list/detail milestone: `npx tsc --noEmit` + `npm run build` pass; route list includes
  `ƒ /dashboard/points/[studentId]`; «تقييم» modal added with instant score/history refresh.
- CV/PATCH milestone: `node --check` all server files; server restart healthy; `npx tsc --noEmit`;
  `npm run build` pass (route list now includes `ƒ /dashboard/students/[userId]`). Live PATCH test:
  manager partial edit → 200 with changed field `بعد التعديل`, cleared field `null`, bundle returned;
  protected `email` field → 400; unknown field → 400; original values restored afterwards.
- Score milestone: `node --check` all server files; server restart healthy; `npx tsc --noEmit`;
  `npm run build` pass (16 routes incl. manager/supervisor/student scores). Live API test: decrease
  without severity → 400; invalid severity → 400; increase with severity sent → 201 and stored
  severity `null`; decrease with `moderate` → 201 and stored correctly; score chain 100→110→107;
  manager list → newest-first (`-3` first); score restored to 100 and test rows removed.
- Deployment milestone: `node --check` all server files; `logConfigDiagnostics()` prints resolved
  origins/client URL without secrets; `npx tsc --noEmit` + `npm run build` pass with 16 routes.

## 7. Next steps
- **Vercel:** on `wamy-server` set `CLIENT_ORIGIN=https://wamy-gray.vercel.app` (and optionally
  `CLIENT_URL` to the same value), then **Redeploy the server**. On `wamy-client`, confirm
  `NEXT_PUBLIC_API_URL=https://wamy-server.vercel.app`, `BETTER_AUTH_URL=https://wamy-gray.vercel.app`,
  `DB_URI`, `DB_NAME`, `BETTER_AUTH_SECRET`, then **Redeploy the client** (NEXT_PUBLIC_* is baked
  at build time). Check logs for `[config]` / `[cors]` / `[auth]` diagnostics.
- Run locally with `npm run dev` in `wamy-client` and `npm start` in `wamy-server`.
- Keep `DB_NAME` identical in both `.env` files; never reintroduce a plural `users` helper.
- If opening the client from a LAN IP / other hostname, add that exact origin to `CLIENT_ORIGIN`
  on the server and set `NEXT_PUBLIC_API_URL` to the reachable API host.
- Keep `CLIENT_URL` on wamy-server and `BETTER_AUTH_URL` on wamy-client set to the SAME client URL
  so JWT `iss`/`aud` and the JWKS URL match. Never add an `AUTH_SECRET` to wamy-server.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
