import {
  BookOpen,
  GraduationCap,
  IdCard,
  Info,
  LayoutDashboard,
  Trophy,
  UserCog,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";
import { STUDENT_DETAIL_SECTIONS } from "@/lib/studentDetailsMeta";
import type { UserRole } from "@/lib/types/users";

export interface DashboardNavLink {
  href: string;
  label: string;
  icon: LucideIcon;
  children?: DashboardNavLink[];
}

const sectionIcons: LucideIcon[] = [IdCard, BookOpen, GraduationCap, Trophy, Info];

/** The five modular student detail sections are tabs inside the profile route. */
const profileSectionLinks: DashboardNavLink[] = STUDENT_DETAIL_SECTIONS.map(
  (section, index) => ({
    href: `/dashboard/student/profile?section=${section.key}`,
    label: section.label,
    icon: sectionIcons[index] ?? Info,
  }),
);

/**
 * Every valid route under src/app/(dashboard)/dashboard, mapped to the only
 * role allowed to see it. Shared `/dashboard` is included in each role.
 */
export const DASHBOARD_NAV: Record<UserRole, DashboardNavLink[]> = {
  manager: [
    { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
    {
      href: "/dashboard/manager/supervisors",
      label: "المشرفون",
      icon: UserCog,
    },
    { href: "/dashboard/manager/users", label: "كل المستخدمين", icon: Users },
    {
      href: "/dashboard/manager/students",
      label: "الطلاب وملفاتهم",
      icon: GraduationCap,
    },
    { href: "/dashboard/manager/scores", label: "نظام النقاط", icon: Trophy },
  ],
  supervisor: [
    { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
    {
      href: "/dashboard/supervisor/students",
      label: "الطلاب",
      icon: GraduationCap,
    },
    {
      href: "/dashboard/supervisor/students/new",
      label: "إضافة طالب",
      icon: UserPlus,
    },
    { href: "/dashboard/supervisor/scores", label: "نظام النقاط", icon: Trophy },
  ],
  student: [
    { href: "/dashboard", label: "نظرة عامة", icon: LayoutDashboard },
    {
      href: "/dashboard/student/overview",
      label: "ملفي ودرجتي",
      icon: IdCard,
    },
    { href: "/dashboard/student/scores", label: "نظام النقاط", icon: Trophy },
    {
      href: "/dashboard/student/profile",
      label: "بياناتي (5 أقسام)",
      icon: BookOpen,
      children: profileSectionLinks,
    },
  ],
};

export const ROLE_NAV_TITLES: Record<UserRole, string> = {
  manager: "لوحة المدير",
  supervisor: "لوحة المشرف",
  student: "لوحة الطالب",
};
