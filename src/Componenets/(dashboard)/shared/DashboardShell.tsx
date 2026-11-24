"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  apiFetch,
  clearToken,
  getToken,
  type UserResponse,
} from "@/lib/api/api-client";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/labels";
import type { IUser, UserRole } from "@/lib/types/users";

const DashboardUserContext = createContext<IUser | null>(null);

/** Current authenticated user, provided by DashboardShell to every dashboard page. */
export function useDashboardUser(): IUser | null {
  return useContext(DashboardUserContext);
}

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: Record<UserRole, NavItem[]> = {
  manager: [
    { href: "/dashboard", label: "نظرة عامة" },
    { href: "/dashboard/manager/supervisors", label: "المشرفون" },
    { href: "/dashboard/manager/users", label: "كل المستخدمين" },
    { href: "/dashboard/manager/students", label: "الطلاب وملفاتهم" },
  ],
  supervisor: [
    { href: "/dashboard", label: "نظرة عامة" },
    { href: "/dashboard/supervisor/students", label: "الطلاب" },
    { href: "/dashboard/supervisor/students/new", label: "إضافة طالب" },
  ],
  student: [
    { href: "/dashboard", label: "نظرة عامة" },
    { href: "/dashboard/student/overview", label: "ملفي ودرجتي" },
    { href: "/dashboard/student/profile", label: "بياناتي (5 أقسام)" },
  ],
};

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    if (!getToken()) {
      router.replace("/signin");
      return () => {
        active = false;
      };
    }

    apiFetch<UserResponse>("/api/auth/me")
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        clearToken();
        if (active) router.replace("/signin");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [router]);

  // Role guard: any /dashboard/<role>/... path is only allowed for that role.
  const roleSegment = pathname?.match(/^\/dashboard\/([^/]+)/)?.[1];
  const hasAccess = !roleSegment || roleSegment === user?.role;

  useEffect(() => {
    if (user && !hasAccess) {
      router.replace("/dashboard");
    }
  }, [user, hasAccess, router]);

  function handleLogout() {
    clearToken();
    router.replace("/signin");
  }

  if (loading) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#EBE2CA] text-[#1E4831]">
        جارٍ التحميل...
      </div>
    );
  }

  if (!user) return null;

  const navItems = NAV_ITEMS[user.role];
  const isActive = (href: string) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <DashboardUserContext.Provider value={user}>
      <div dir="rtl" className="min-h-screen bg-[#EBE2CA] text-[#1E4831]">
        <header className="border-b border-[#D5C9AE] bg-[#F9F5EC]">
          <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-4 py-4 sm:px-6">
            <Link href="/" className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1E4831] text-sm font-extrabold text-[#F9F5EC]">
                و
              </span>
              <span className="flex flex-col">
                <span className="text-base font-extrabold text-[#1E4831]">السكن الجامعي</span>
                <span className="text-xs text-[#657F71]">لوحة إدارة السكن</span>
              </span>
            </Link>

            <div className="flex items-center gap-3">
              <div className="text-left">
                <p className="text-sm font-bold text-[#1E4831]">{user.name}</p>
                <p className="text-xs text-[#657F71]" dir="ltr">{user.email}</p>
              </div>
              <span className={`rounded-full border px-3 py-1 text-xs font-bold ${ROLE_BADGE_CLASSES[user.role]}`}>
                {ROLE_LABELS[user.role]}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="cursor-pointer rounded-xl border border-[#D5C9AE] bg-white px-4 py-2 text-xs font-semibold text-[#1E4831] transition-colors hover:border-[#DE2F2C] hover:text-[#DE2F2C]"
              >
                تسجيل الخروج
              </button>
            </div>
          </div>
        </header>

        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8 sm:px-6 lg:flex-row">
          <aside className="w-full shrink-0 lg:w-60">
            <nav className="flex flex-col gap-1 rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-3">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${
                    isActive(item.href)
                      ? "bg-[#1E4831] font-bold text-[#F9F5EC]"
                      : "font-semibold text-[#3E5E4D] hover:bg-[#DCE6E0] hover:text-[#1E4831]"
                  }`}
                >
                  {item.label}
                </Link>
              ))}
              <div className="my-2 border-t border-[#D5C9AE]" />
              <Link
                href="/"
                className="rounded-xl px-4 py-2.5 text-sm font-semibold text-[#657F71] transition-colors hover:bg-[#DCE6E0] hover:text-[#1E4831]"
              >
                العودة للموقع
              </Link>
            </nav>
          </aside>

          <main className="min-w-0 flex-1">{hasAccess ? children : null}</main>
        </div>
      </div>
    </DashboardUserContext.Provider>
  );
}
