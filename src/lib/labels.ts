import type { UserRole, UserStatus } from "@/lib/types/users";

export const ROLE_LABELS: Record<UserRole, string> = {
  manager: "مدير",
  supervisor: "مشرف",
  student: "طالب",
};

export const STATUS_LABELS: Record<UserStatus, string> = {
  active: "نشط",
  suspended: "موقوف",
};

export const ROLE_BADGE_CLASSES: Record<UserRole, string> = {
  manager: "bg-[#FDE8E7] text-[#DE2F2C] border-[#DE2F2C]/25",
  supervisor: "bg-[#DCE6E0] text-[#1E4831] border-[#1E4831]/20",
  student: "bg-[#F9F5EC] text-[#3E5E4D] border-[#D5C9AE]",
};

export const STATUS_BADGE_CLASSES: Record<UserStatus, string> = {
  active: "bg-[#DCE6E0] text-[#1E4831] border-[#1E4831]/20",
  suspended: "bg-[#FDE8E7] text-[#931815] border-[#DE2F2C]/25",
};
