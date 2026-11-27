"use client";

import {
  createContext,
  Suspense,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { AlertTriangle, Menu, RefreshCw } from "lucide-react";
import {
  ApiError,
  apiFetch,
  clearToken,
  getToken,
  type UserResponse,
} from "@/lib/api/api-client";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/labels";
import type { IUser } from "@/lib/types/users";
import DashboardSidebar from "./DashboardSidebar";

const DashboardUserContext = createContext<IUser | null>(null);

/** Current authenticated user, provided by DashboardShell to every dashboard page. */
export function useDashboardUser(): IUser | null {
  return useContext(DashboardUserContext);
}

export default function DashboardShell({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<IUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;

    async function load() {
      setLoading(true);
      setError("");

      if (!getToken()) {
        if (active) {
          setError("لا توجد جلسة نشطة. سجّل الدخول للمتابعة.");
          setLoading(false);
        }
        return;
      }

      try {
        const data = await apiFetch<UserResponse>("/api/auth/me");
        if (active) setUser(data.user);
      } catch (err) {
        if (!active) return;
        const status = err instanceof ApiError ? err.status : 0;

        if (status === 401) {
          clearToken();
          setError("انتهت الجلسة أو الرمز غير صالح. سجّل الدخول مرة أخرى.");
        } else if (status === 0) {
          setError(
            "تعذر الاتصال بالخادم. تأكد من نشر wamy-server وأن CORS يسمح بنطاق هذا الموقع، ثم أعد المحاولة.",
          );
        } else {
          setError(err instanceof Error ? err.message : "تعذر التحقق من الجلسة.");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [attempt]);

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Role guard: role-scoped paths are private. Shared office routes
  // /dashboard/students/[userId] and /dashboard/points/[studentId] are reserved
  // for manager + supervisor.
  const roleSegment = pathname?.match(/^\/dashboard\/([^/]+)/)?.[1];
  const officeRoute =
    (roleSegment === "students" || roleSegment === "points") &&
    (user?.role === "manager" || user?.role === "supervisor");
  const hasAccess = !roleSegment || roleSegment === user?.role || officeRoute;

  useEffect(() => {
    if (user && !hasAccess) {
      router.replace("/dashboard");
    }
  }, [user, hasAccess, router]);

  function handleLogout() {
    clearToken();
    router.push("/signin");
  }

  if (loading) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#EBE2CA] text-[#1E4831]">
        جارٍ التحقق من الجلسة...
      </div>
    );
  }

  if (error || !user) {
    return (
      <div dir="rtl" className="flex min-h-screen items-center justify-center bg-[#EBE2CA] p-4">
        <div className="w-full max-w-md rounded-3xl border border-[#DE2F2C]/25 bg-[#F9F5EC] p-8 text-center shadow-lg">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-[#DE2F2C]/25 bg-[#FDE8E7] text-[#DE2F2C]">
            <AlertTriangle className="h-6 w-6" />
          </span>
          <h1 className="mt-4 text-lg font-extrabold text-[#1E4831]">تعذر فتح لوحة التحكم</h1>
          <p role="alert" className="mt-2 text-sm leading-relaxed text-[#931815]">
            {error || "تعذر تحديد حالة الجلسة."}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => setAttempt((value) => value + 1)}
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E4831] px-5 py-2.5 text-sm font-bold text-[#F9F5EC] transition-colors hover:bg-[#132F20]"
            >
              <RefreshCw className="h-4 w-4" />
              إعادة المحاولة
            </button>
            <Link
              href="/signin"
              className="rounded-xl border border-[#D5C9AE] bg-white px-5 py-2.5 text-sm font-bold text-[#1E4831] transition-colors hover:border-[#DE2F2C] hover:text-[#DE2F2C]"
            >
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <DashboardUserContext.Provider value={user}>
      <div dir="rtl" className="min-h-screen bg-[#EBE2CA] text-[#1E4831]">
        <Suspense fallback={null}>
          <DashboardSidebar
            user={user}
            collapsed={sidebarCollapsed}
            onToggleCollapse={() => setSidebarCollapsed((value) => !value)}
            mobileOpen={mobileOpen}
            onCloseMobile={() => setMobileOpen(false)}
            onLogout={handleLogout}
          />
        </Suspense>

        <div
          className={`flex min-h-screen flex-col transition-[padding] duration-300 ${
            sidebarCollapsed ? "lg:pr-20" : "lg:pr-72"
          }`}
        >
          <header className="border-b border-[#D5C9AE] bg-[#F9F5EC]">
            <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-6">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setMobileOpen(true)}
                  aria-label="فتح القائمة"
                  className="cursor-pointer rounded-xl border border-[#D5C9AE] bg-white p-2.5 text-[#1E4831] transition-colors hover:bg-[#DCE6E0] lg:hidden"
                >
                  <Menu className="h-5 w-5" />
                </button>
                <Link href="/" className="flex items-center gap-2 lg:hidden">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1E4831] text-sm font-extrabold text-[#F9F5EC]">
                    و
                  </span>
                  <span className="text-sm font-extrabold">السكن الجامعي</span>
                </Link>
              </div>

              <div className="flex items-center gap-3">
                <span className="hidden text-sm font-semibold text-[#3E5E4D] sm:block">
                  مرحبًا، {user.name}
                </span>
                <span
                  className={`rounded-full border px-3 py-1 text-xs font-bold ${ROLE_BADGE_CLASSES[user.role]}`}
                >
                  {ROLE_LABELS[user.role]}
                </span>
              </div>
            </div>
          </header>

          <main className="mx-auto w-full max-w-7xl min-w-0 flex-1 px-4 py-8 sm:px-6">
            {hasAccess ? children : null}
          </main>
        </div>
      </div>
    </DashboardUserContext.Provider>
  );
}
