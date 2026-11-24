# WamyDorm — Project Context (single source of truth)

This is the **only** `AGENTS.md` in the workspace and documents BOTH repositories:
`wamy-client` (Next.js 16.4.6 App Router + TypeScript) and `wamy-server` (Node/Express +
native MongoDB driver). Keep it updated after every milestone. Do NOT create `wamy-server/AGENTS.md`.

**Client code rule:** before writing client code, read the version-matched guides in
`wamy-client/node_modules/next/dist/docs/` (`01-app/01-getting-started/05-server-and-client-components.md`,
`01-app/03-api-reference/03-file-conventions/route-groups.md`, `layout.md`, and
`01-app/02-guides/upgrading/version-16.md`). `params`/`searchParams`/`cookies()` are async,
`middleware` is now `proxy`, interactive components need `"use client"`.

---

## 1. Architecture decisions (current)

### Roles & permissions (3 roles)
| Role | May create | May view / edit |
|---|---|---|
| `manager` | only `supervisor` | all users; any student's 5-section bundle; student review `score` |
| `supervisor` | only `student` (lightweight account) | only students; any student's 5-section bundle |
| `student` | nothing | only own account + own 5-section bundle; upserts own sections |

- Public registration is OFF. Login = email (`.trim().toLowerCase()`) + password.
- Passwords are scrypt-hashed and never returned by any API response.
- Target `role` is forced server-side. `createdBy` stores the **creator's name**.
- Express API owns users/RBAC + student details; Better Auth client/hooks remain configured
  for later unified-session work.

### Lightweight `users` collection
`_id` (ObjectId), `name`, `email` (unique, normalized lowercase), `password` (hashed, hidden),
`role` (`manager`|`supervisor`|`student`), `status` (`active`|`suspended`, default `active`),
`phone` (string|null), `createdBy` (string|null — creator's name), `createdAt`, `updatedAt`.
`score?: number` exists **only on student documents** (seeded from `INITIAL_REVIEW_SCORE`,
manager-editable). No embedded `studentProfile` object anymore.

### Five separate student detail collections (linked by `userId`, unique index on each)
| Section key | Collection | Content |
|---|---|---|
| `personal` | `student_personal_info` | fullNameAr/En, passport (normalized `.trim().toLowerCase()`), passportExpiryDate, iqamaExpiryDate, universityStudentId, birthDate, gender, nationality, religion?, maritalStatus, flatNo, roomNo, detailedAddress, phone, personalEmail, universityEmail?, emergencyContactName, emergencyPhone |
| `academic` | `student_academic_info` | faculty, department, currentLevel (level_1..5), currentSemester, studyType, enrollmentStatus, gpa, completedCredits, remainingCredits, enrollmentDate, expectedGraduationDate, academicAdvisor?, graduationProject? |
| `skills` | `student_skills_talents` | languages[], computerAndProgrammingSkills[]?, softSkills[]?, artisticTalents[]?, sportsTalents[]?, hobbiesAndInterests[], trainingCourses[]?, professionalCertificates[]?, practicalExperience[]? |
| `achievements` | `student_achievements` | academicAwards[]?, competitions[]?, studentActivities[]?, volunteering[]?, publicationsAndResearch[]? |
| `additional` | `student_additional_info` | iqScore?, aptitudeTestScores?, scholarshipStatus, scholarshipProvider, generalNotes? |

Common fields in every detail collection: `_id`, `userId` (unique), `isCompleted`, `createdAt`, `updatedAt`.
Future collections (attendance, fees, leaves, documents) will also be separate and keyed by student id.

### Folder conventions
- `src/app/(root)` public pages (`/`, `/signin`); `src/app/(dashboard)` authenticated routes.
- `src/Componenets/(root)` / `src/Componenets/(dashboard)` (keep the `Componenets` spelling).
- `src/lib/types/users.ts`, `src/lib/types/studentDetails.ts`, `src/lib/studentDetailsMeta.ts`,
  `src/lib/api/api-client.ts`, `src/lib/labels.ts`, `src/lib/format.ts`.
- Server entry `wamy-server/index.js` mounts routes directly and keeps `connectToMongoDB()`.

---

## 2. File inventory

### Client — created / rewritten in the final refactor
- `src/lib/types/users.ts` — final clean shape: `UserRole`, `UserStatus` (active|suspended),
  `IUser` with optional `score`, `createdBy` = creator name, dates `Date | string`; aliases
  `tUserRole`/`tUserStatus`. No `StudentProfile` / `IStudentProfile`.
- `src/lib/types/studentDetails.ts` — 5 section interfaces, common base fields,
  `StudentFullDetailsBundle` with `completionSummary`.
- `src/lib/studentDetailsMeta.ts` — declarative field metadata (labels, types, enum options)
  shared by the profile form and detail viewer; `formatFieldValue()`.
- `src/lib/labels.ts` — role/status labels + badge classes (no `archived`).
- `src/lib/api/api-client.ts` — token storage (`wamy_token`), `apiFetch<T>()`,
  `AuthResponse`/`UserResponse`/`UsersResponse`/`StudentDetailsBundleResponse`/`SectionSaveResponse`.
- `src/Componenets/(dashboard)/shared/DashboardShell.tsx` — dynamic nav + role badge +
  logout + `DashboardUserContext`/`useDashboardUser()`; **role guard** redirects
  `/dashboard/<role>/...` to `/dashboard` when the role does not match.
- `shared/DashboardOverview.tsx` (role-aware summary cards + quick actions),
  `shared/UsersTable.tsx` (status badges, `createdBy`, top-level `score`, manager score editor),
  `shared/StudentDirectory.tsx` (student list + X/5 completion + inspect bundle),
  `shared/StudentDetailsViewer.tsx` (renders all 5 sections),
  `shared/FormFields.tsx` (TextField/MetaField/FormMessage).
- `manager/SupervisorsView.tsx`, `manager/UsersView.tsx`, `manager/StudentsView.tsx`.
- `supervisor/StudentsView.tsx`, `supervisor/CreateStudentForm.tsx` (only name/email/password/phone).
- `student/ProfileForm.tsx` — 5-tab multi-step form with progress (0/5 → 5/5), per-section
  PUT upserts, validation-aligned payloads (tags -> string[], numbers parsed, passport lowercase
  done server-side).
- `student/StudentOverview.tsx` — account info, room/flat, review score, 5-section completion.
- Client routes: `src/app/(dashboard)/dashboard/page.tsx` plus
  `dashboard/manager/{supervisors,users,students}/page.tsx`,
  `dashboard/supervisor/students/page.tsx`,
  `dashboard/supervisor/students/new/page.tsx`,
  `dashboard/student/{profile,overview}/page.tsx`.
- Removed obsolete: `shared/RoleBasedView.tsx`, `manager/ManagerView.tsx`,
  `supervisor/SupervisorView.tsx`, `student/StudentView.tsx` (embedded-profile era).
- Unchanged: root layout/pages, Home/shared root components, `src/app/api/auth/[...all]/route.ts`,
  sign-in page/form, Navbar/Footer links, `auth.ts`, `auth-client.ts`.

### Server — created / rewritten
- `config.js` — `DB_URI`, `DB_NAME`, `PORT`, `INITIAL_REVIEW_SCORE`, `AUTH_SECRET`, `CLIENT_ORIGIN`.
- `db.js` — `connectToMongoDB()`, `getDb()`, `usersCollection()`, `STUDENT_DETAIL_COLLECTIONS`,
  `SECTION_KEYS`, `studentDetailsCollection(section)`, `ensureIndexes()` (unique email +
  unique `userId` index on each of the 5 collections), `closeMongoDB()`.
- `utils/password.js` (scrypt), `utils/token.js` (HMAC bearer token; JWT-swappable),
  `utils/validation.js` (email/login/supervisor/student/score validators, `readString`, `readDate`).
- `utils/studentDetailsValidation.js` — required-field + enum + date/number/array checks for all
  5 sections; passport normalized `.trim().toLowerCase()`.
- `services/users.js` — `toSafeUser()`, `findUserByEmail/Id()`, `createUser()` (score only for
  students), `listUsers()`, `updateStudentScore()` (top-level `score`).
- `services/studentDetails.js` — `isStudentAccount()`, `getStudentBundle()`,
  `upsertStudentSection()` (`updateOne(..., { upsert: true })`, `isCompleted: true`).
- `middleware.js` — `verifyUser`, `isManager`, `isSupervisor`, `isStudent`.
- `routes/auth.js`, `routes/users.js`, `routes/studentDetails.js`.
- `index.js` — mounts `/api/auth`, `/api/users`, `/api/student-details`; exports `connectToMongoDB()`.

---

## 3. API

| Method | Path | Access | Purpose |
|---|---|---|---|
| GET | `/` | public | Health check |
| POST | `/api/auth/login` | public | email+password → `{ token, user }` |
| GET | `/api/auth/me` | auth | current safe user |
| POST | `/api/users/supervisors` | manager | create supervisor (`createdBy` = manager name) |
| POST | `/api/users/students` | supervisor | create lightweight student; score seeded; `createdBy` = supervisor name |
| GET | `/api/users` | auth | manager → all, supervisor → students, student → self |
| GET | `/api/users/me` | auth | own account |
| PATCH | `/api/users/:id/score` | manager | edit student top-level `score` |
| GET | `/api/student-details/me` | student | own 5-section bundle + `completionSummary` |
| GET | `/api/student-details/:userId` | manager/supervisor; student only self | any student's bundle |
| PUT | `/api/student-details/:section` | student | upsert own section (`isCompleted: true`) |

`section` must be one of `personal|academic|skills|achievements|additional`.
`verifyUser` sets `req.userId`/`req.user`; no password ever appears in responses.

---

## 4. Environment variables

**Server `.env`:** `DB_URI` (required), `DB_NAME?`, `PORT?` (5000), `INITIAL_REVIEW_SCORE?` (100),
`AUTH_SECRET` (required in production), `CLIENT_ORIGIN?` (http://localhost:3000).
**Client `.env`:** `NEXT_PUBLIC_API_URL` (default http://localhost:5000),
`NEXT_PUBLIC_BETTER_AUTH_URL` / `BETTER_AUTH_URL`, `DB_URI` (Better Auth adapter).
Never commit real values.

---

## 5. Verification & next steps

- Verified: `node --check` on all server `.js` files; `npx tsc --noEmit`; `npm run build`.
  Build routes: `/`, `/signin`, `/dashboard`, `/dashboard/manager/{supervisors,users,students}`,
  `/dashboard/supervisor/students`, `/dashboard/supervisor/students/new`,
  `/dashboard/student/{profile,overview}`, `/api/auth/[...all]`.
- Next: seed the first manager directly in MongoDB; set env vars; start both servers and
  smoke-test manager → supervisor → lightweight student → student filling 5 sections.
- Optional future: swap HMAC token for a real JWT library (token logic is isolated); wire Better
  Auth sessions into the same `users` collection; add attendance/fees/leaves/documents collections.
