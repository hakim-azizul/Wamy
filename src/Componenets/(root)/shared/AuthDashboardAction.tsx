"use client";

import { Link } from "@heroui/react";
import { useAuthStatus } from "@/lib/useAuthStatus";

type Variant = "pill" | "menu" | "cta";

/**
 * Single source of the public-site auth action:
 * unauthenticated → Sign in (دخول الأعضاء), authenticated → Dashboard (لوحة التحكم).
 * Encapsulates the auth-state check and supports desktop pill / mobile menu / footer CTA styling.
 */
export default function AuthDashboardAction({
  variant = "pill",
  onNavigate,
}: {
  variant?: Variant;
  onNavigate?: () => void;
}) {
  const { isAuthenticated } = useAuthStatus();
  const href = isAuthenticated ? "/dashboard" : "/signin";
  const label = isAuthenticated ? "لوحة التحكم" : "دخول الأعضاء";

  if (variant === "menu") {
    return (
      <Link
        href={href}
        onPress={onNavigate}
        className="nav-link-underline py-1.5 text-base font-semibold text-[#1E4831] transition-colors hover:text-[#DE2F2C]"
      >
        {label}
      </Link>
    );
  }

  if (variant === "cta") {
    return (
      <Link
        href={href}
        className="inline-flex items-center justify-center rounded-xl bg-[#DE2F2C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#BD221F] active:bg-[#931815]"
      >
        {label}
      </Link>
    );
  }

  return (
    <Link
      href={href}
      className="group flex flex-row items-center gap-2 rounded-full border border-[#1E4831]/40 bg-[#F9F5EC]/70 px-5 py-2.5 text-sm font-semibold text-[#1E4831] transition-all duration-300 hover:border-[#1E4831] hover:bg-[#1E4831] hover:text-[#F9F5EC] active:bg-[#132F20]"
    >
      <span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.8}
          stroke="currentColor"
          className="h-4 w-4 text-[#1E4831] transition-colors duration-300 group-hover:text-[#F9F5EC]"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z"
          />
        </svg>
      </span>
      {label}
    </Link>
  );
}
