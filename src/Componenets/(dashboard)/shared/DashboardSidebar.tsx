"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Home,
  LogOut,
  X,
} from "lucide-react";
import {
  DASHBOARD_NAV,
  ROLE_NAV_TITLES,
  type DashboardNavLink,
} from "@/lib/dashboardNav";
import { ROLE_BADGE_CLASSES, ROLE_LABELS } from "@/lib/labels";
import type { IUser } from "@/lib/types/users";

interface DashboardSidebarProps {
  user: IUser;
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onLogout: () => void;
}

export default function DashboardSidebar(props: DashboardSidebarProps) {
  const { collapsed, mobileOpen, onCloseMobile, user } = props;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="إغلاق القائمة"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-[#132F20]/50 lg:hidden"
        />
      )}

      {/* Desktop sidebar (RTL: fixed to the right edge) */}
      <aside
        className={`fixed inset-y-0 right-0 z-30 hidden flex-col border-l border-[#D5C9AE] bg-[#F9F5EC] shadow-sm transition-[width] duration-300 lg:flex ${
          collapsed ? "w-20" : "w-72"
        }`}
      >
        <SidebarContent {...props} isMobile={false} />
      </aside>

      {/* Mobile drawer */}
      <aside
        className={`fixed inset-y-0 right-0 z-50 flex w-72 flex-col border-l border-[#D5C9AE] bg-[#F9F5EC] shadow-xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <SidebarContent {...props} isMobile />
      </aside>
    </>
  );
}

type SidebarContentProps = DashboardSidebarProps & { isMobile: boolean };

function SidebarContent({
  user,
  collapsed: desktopCollapsed,
  onToggleCollapse,
  onCloseMobile,
  onLogout,
  isMobile,
}: SidebarContentProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const collapsed = isMobile ? false : desktopCollapsed;
  const links = DASHBOARD_NAV[user.role];
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (pathname === "/dashboard/student/profile") setExpanded(true);
  }, [pathname]);

  /** Longest matching href wins, so `/students/new` does not also mark `/students`. */
  const activeHref = (() => {
    const sectionParam = searchParams.get("section");
    if (sectionParam) {
      const child = links
        .flatMap((link) => link.children ?? [])
        .find((item) => item.href.endsWith(`?section=${sectionParam}`));
      if (child) return child.href;
    }

    const allLinks = links.flatMap((link) => [link, ...(link.children ?? [])]);
    return (
      allLinks
        .filter((item) => {
          const path = item.href.split("?")[0];
          return path === "/dashboard"
            ? pathname === path
            : pathname === path || pathname?.startsWith(`${path}/`);
        })
        .sort((a, b) => b.href.length - a.href.length)[0]?.href ?? ""
    );
  })();

  return (
    <>
      <div className="flex items-center justify-between gap-2 border-b border-[#D5C9AE] px-4 py-4">
        <Link href="/dashboard" onClick={onCloseMobile} className="flex min-w-0 items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1E4831] text-sm font-extrabold text-[#F9F5EC]">
            و
          </span>
          {!collapsed && (
            <span className="flex min-w-0 flex-col">
              <span className="truncate text-sm font-extrabold text-[#1E4831]">السكن الجامعي</span>
              <span className="truncate text-[11px] text-[#657F71]">
                {ROLE_NAV_TITLES[user.role]}
              </span>
            </span>
          )}
        </Link>

        {isMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="إغلاق القائمة"
            className="cursor-pointer rounded-lg p-2 text-[#1E4831] transition-colors hover:bg-[#DCE6E0]"
          >
            <X className="h-5 w-5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? "توسيع القائمة" : "طي القائمة"}
            className="cursor-pointer rounded-lg p-2 text-[#3E5E4D] transition-colors hover:bg-[#DCE6E0] hover:text-[#1E4831]"
          >
            {collapsed ? <ChevronLeft className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {!collapsed && (
          <p className="px-3 pb-2 text-[11px] font-bold tracking-wide text-[#657F71]">
            القائمة الرئيسية
          </p>
        )}

        {links.map((link) => (
          <NavLink
            key={link.href}
            link={link}
            collapsed={collapsed}
            activeHref={activeHref}
            expanded={expanded}
            onToggleExpand={() => setExpanded((value) => !value)}
            onNavigate={onCloseMobile}
          />
        ))}

        <div className="my-3 border-t border-[#D5C9AE]" />
        <Link
          href="/"
          onClick={onCloseMobile}
          title={collapsed ? "العودة للموقع" : undefined}
          className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-[#657F71] transition-colors hover:bg-[#DCE6E0] hover:text-[#1E4831] ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <Home className="h-5 w-5 shrink-0" />
          {!collapsed && <span>العودة للموقع</span>}
        </Link>
      </nav>

      {/* User profile + logout footer */}
      <div className="border-t border-[#D5C9AE] p-3">
        <div
          className={`flex items-center gap-3 rounded-xl bg-[#DCE6E0]/70 p-2.5 ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#1E4831] text-sm font-extrabold text-[#F9F5EC]">
            {user.name.charAt(0)}
          </span>
          {!collapsed && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-bold text-[#1E4831]">{user.name}</span>
              <span
                className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[10px] font-bold ${ROLE_BADGE_CLASSES[user.role]}`}
              >
                {ROLE_LABELS[user.role]}
              </span>
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onLogout}
          title={collapsed ? "تسجيل الخروج" : undefined}
          className={`mt-2 flex w-full cursor-pointer items-center gap-3 rounded-xl border border-[#D5C9AE] bg-white px-3 py-2.5 text-sm font-bold text-[#1E4831] transition-colors hover:border-[#DE2F2C] hover:text-[#DE2F2C] ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut className="h-4 w-4 shrink-0" />
          {!collapsed && <span>تسجيل الخروج</span>}
        </button>
      </div>
    </>
  );
}

function NavLink({
  link,
  collapsed,
  activeHref,
  expanded,
  onToggleExpand,
  onNavigate,
}: {
  link: DashboardNavLink;
  collapsed: boolean;
  activeHref: string;
  expanded: boolean;
  onToggleExpand: () => void;
  onNavigate: () => void;
}) {
  const hasChildren = Boolean(link.children?.length);
  const isActive = activeHref === link.href || Boolean(link.children?.some((c) => c.href === activeHref));
  const path = link.href.split("?")[0];

  return (
    <div>
      <div className={`flex items-center rounded-xl ${isActive ? "bg-[#1E4831]" : ""}`}>
        <Link
          href={path}
          onClick={onNavigate}
          title={collapsed ? link.label : undefined}
          className={`flex min-w-0 flex-1 items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
            collapsed ? "justify-center" : ""
          } ${
            isActive
              ? "font-bold text-[#F9F5EC]"
              : "font-semibold text-[#3E5E4D] hover:bg-[#DCE6E0] hover:text-[#1E4831]"
          }`}
        >
          <link.icon className="h-5 w-5 shrink-0" />
          {!collapsed && <span className="truncate">{link.label}</span>}
        </Link>
        {hasChildren && !collapsed && (
          <button
            type="button"
            onClick={onToggleExpand}
            aria-label="إظهار أو إخفاء الأقسام"
            className={`cursor-pointer rounded-lg p-2 transition-colors ${
              isActive ? "text-[#F9F5EC] hover:bg-white/10" : "text-[#657F71] hover:bg-[#DCE6E0]"
            }`}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
          </button>
        )}
      </div>

      {hasChildren && expanded && !collapsed && (
        <div className="mr-5 mt-1 space-y-1 border-r border-[#D5C9AE] pr-3">
          {link.children?.map((child) => {
            const childActive = activeHref === child.href;
            return (
              <Link
                key={child.href}
                href={child.href}
                onClick={onNavigate}
                className={`flex items-center gap-2 rounded-lg px-2 py-2 text-xs transition-colors ${
                  childActive
                    ? "bg-[#DCE6E0] font-bold text-[#1E4831]"
                    : "font-semibold text-[#657F71] hover:bg-[#DCE6E0] hover:text-[#1E4831]"
                }`}
              >
                <child.icon className="h-4 w-4 shrink-0" />
                <span className="truncate">{child.label}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
