import type { IUser, UserRole } from "@/lib/types/users";

/** Mirrors DELETE /api/users/:id authorization on the server. */
export function canDeleteUser(actorRole: UserRole | undefined, target: IUser): boolean {
  if (!actorRole || actorRole === "student") return false;
  if (actorRole === "manager") return target.role === "supervisor" || target.role === "student";
  return target.role === "student"; // supervisor
}
