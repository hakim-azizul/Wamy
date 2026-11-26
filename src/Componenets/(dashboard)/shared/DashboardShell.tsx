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
import { Menu } from "lucide-react";
import {
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

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

  // Close the mobile drawer whenever the route changes.
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  // Role guard: role-scoped paths are private. The shared CV route
  // /dashboard/students/[userId] is reserved for manager + supervisor.
  const roleSegment = pathname?.match(/^\/dashboard\/([^/]+)/)?.[1];
  const sharedCvRoute =
    roleSegment === "students" &&
    (user?.role === "manager" || user?.role === "supervisor");
  const hasAccess = !roleSegment || roleSegment === user?.role || sharedCvRoute;

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
