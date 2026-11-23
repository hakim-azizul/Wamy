/**
 * Shared domain types for WamyDorm.
 *
 * Single source of truth for roles, statuses and the 13-field StudentProfile.
 * `password` is intentionally NOT part of IUser: it is stored (hashed) in the
 * database but must never be returned in an API response or client payload.
 */

export type UserRole = "manager" | "supervisor" | "student";
export type UserStatus = "active" | "suspended" | "archived";

/** Student academic / review profile. Field #13 is `score`. */
export interface StudentProfile {
  name: string; // 1. Student full name
  fathersName: string; // 2. Father's name
  passportNumber: string; // 3. Normalized: trim().toUpperCase()
  passportExpiryDate: Date; // 4. Passport expiry date
  residencePermitExpiryDate: Date; // 5. Residence permit expiry date
  countryOrNationality: string; // 6. Country / nationality
  university: string; // 7. University
  faculty: string; // 8. Faculty
  department: string; // 9. Department
  academicYear: string; // 10. Academic year
  apartmentNumber: string; // 11. Apartment number
  roomNumber: string; // 12. Room number
  score: number; // 13. Review score (initialized from INITIAL_REVIEW_SCORE, editable by manager)
}

/** Safe user object returned by the WamyDorm Express API (never includes password). */
export interface IUser {
  _id: string;
  name: string; // Common display name for all roles
  email: string // Login email (unique, normalized trim().toLowerCase())
  role: UserRole; // "manager" | "supervisor" | "student"
  status: UserStatus; // Default: "active"
  phone: string | null; // Optional contact number for any role
  createdBy: string | null; // ObjectId (as string) of the manager/supervisor who created this user
  studentProfile?: StudentProfile | null; // Only present when role === "student"
  createdAt: Date;
  updatedAt: Date;
}

// Backwards-compatible aliases for the original placeholder type names.
export type tUserRole = UserRole;
export type tUserStatus = UserStatus;
export type IStudentProfile = StudentProfile;
