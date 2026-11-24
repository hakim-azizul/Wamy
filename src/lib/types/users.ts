export type UserRole = "manager" | "supervisor" | "student";
export type UserStatus = "active" | "suspended";

/** Safe user object returned by the WamyDorm Express API (never includes password). */
export interface IUser {
  _id: string; // automatic created by mongodb
  name: string;
  email: string; // Login email (unique, normalized trim().toLowerCase())
  role: UserRole; // "manager" | "supervisor" | "student"
  status: UserStatus; // Default: "active"
  phone: string | null;
  createdBy: string | null; // name of who created this user
  score?: number; // Only for student (initialized from INITIAL_REVIEW_SCORE, editable later)
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type tUserRole = UserRole;
export type tUserStatus = UserStatus;