"use client";

import React, { useState } from "react";
import { Link } from "@heroui/react";
import Image from "next/image";
import { useAuthStatus } from "@/lib/useAuthStatus";

export default function AppNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState("#about");
  const { isAuthenticated } = useAuthStatus();

  const navItems = [
    { label: "من نحن", href: "#about" },
    { label: "حياة الطالب", href: "#student-life" },
    { label: "معرض الصور", href: "#gallery" },
    { label: "التقديم", href: "#apply" },
    { label: "الأسئلة الشائعة", href: "#faq" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full bg-[#EBE2CA]/95 backdrop-blur-md border-b border-[#D5C9AE]">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* ডান পাশের অংশ: মোবাইল মেনু বাটন + লোগো + السكن الجامعي */}
        <div className="flex items-center gap-3">
          {/* মোবাইল মেনু টগল বাটন */}
          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "إغلاق القائمة" : "فتح القائمة"}
            className="inline-flex items-center justify-center rounded-lg p-2 text-[#1E4831] hover:bg-[#DDD1B2]/70 md:hidden focus:outline-none transition-colors"
          >
            {isMenuOpen ? (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            ) : (
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            )}
          </button>

          {/* লোগোর জায়গা ও ব্র্যান্ড নাম */}
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/Logo.png"
              alt="WAMY Logo"
              width={160}
              height={50}
              className="h-10 w-auto object-contain"
            />
            <span
              style={{ fontFamily: "var(--font-cairo), sans-serif" }}
              className="border-r border-[#B9A988] pr-3 text-base font-bold text-[#3E5E4D] sm:text-lg"
            >
              السكن الجامعي
            </span>
          </Link>
        </div>

        {/* ডেস্কটপ নেভিগেশন লিংকসমূহ */}
        <ul className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = activeLink === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={() => setActiveLink(item.href)}
                  className={`nav-link-underline text-[15px] font-medium text-[#1E4831] hover:text-[#132F20] transition-colors ${
                    isActive ? "active font-semibold text-[#132F20]" : ""
                  }`}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* বাম পাশের অংশ: Outlined মেম্বার লগইন বাটন */}
        <div>
          <Link
            href={isAuthenticated ? "/dashboard" : "/signin"}
            className="group border border-[#1E4831]/40 bg-[#F9F5EC]/70 px-5 py-2.5 text-sm font-semibold text-[#1E4831] rounded-full flex flex-row items-center gap-2 transition-all duration-300 hover:border-[#1E4831] hover:bg-[#1E4831] hover:text-[#F9F5EC] active:bg-[#132F20]"
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
            {isAuthenticated ? "لوحة التحكم" : "دخول الأعضاء"}
          </Link>
        </div>
      </nav>

      {/* মোবাইল ডিভাইসের জন্য ড্রপডাউন মেনু */}
      {isMenuOpen && (
        <div className="border-t border-[#D5C9AE] bg-[#F9F5EC] px-6 py-4 md:hidden">
          <ul className="flex flex-col gap-3">
            {navItems.map((item) => {
              const isActive = activeLink === item.href;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onPress={() => {
                      setActiveLink(item.href);
                      setIsMenuOpen(false);
                    }}
                    className={`nav-link-underline py-1.5 text-base font-medium text-[#1E4831] hover:text-[#132F20] ${
                      isActive ? "active font-semibold text-[#132F20]" : ""
                    }`}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
}