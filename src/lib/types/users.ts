export type UserRole = "manager" | "supervisor" | "student";
export type UserStatus = "active" | "suspended";

export interface IUser {
  _id: string;
  name: string;
  email: string; // unique, normalized trim().toLowerCase()
  role: UserRole;
  status: UserStatus; // default: "active"
  phone: string | null;
  createdBy: string | null; // creator's name (e.g., logged-in manager/supervisor name)
  score?: number; // ONLY present when role === "student" (initialized from INITIAL_REVIEW_SCORE)
  roomNumber?: string; // ONLY present when role === "student" (assigned at account creation)
  flatNumber?: string; // ONLY present when role === "student" (assigned at account creation)
  createdAt: Date | string;
  updatedAt: Date | string;
}

export type tUserRole = UserRole;
export type tUserStatus = UserStatus;
