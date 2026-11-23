"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Mail, Phone, ShieldCheck, ArrowUpLeft } from "lucide-react";

export default function Footer() {
  const quickLinks = [
    { label: "من نحن", href: "#about" },
    { label: "حياة الطالب", href: "#student-life" },
    { label: "معرض الصور", href: "#gallery" },
    { label: "التقديم", href: "#apply" },
    { label: "الأسئلة الشائعة", href: "#faq" },
  ];

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer
      dir="rtl"
      className="bg-linear-to-b from-[#EBE2CA] to-[#E2D6B8] text-[#1E4831] border-t border-[#D5C9AE]"
    >
      <div className="mx-auto max-w-7xl px-4 pt-16 pb-10 sm:px-6 lg:px-8">
        {/* উপরের মূল গ্রিড */}
        <div className="grid grid-cols-1 gap-10 pb-12 lg:grid-cols-12">
          {/* ডান পাশ: লোগো ও সংক্ষিপ্ত পরিচিতি (৫ কলাম) */}
          <div className="lg:col-span-5 space-y-4">
            <Link href="/" className="inline-flex items-center gap-3">
              <Image
                src="/logo.png"
                alt="WAMY Logo"
                width={150}
                height={46}
                className="h-10 w-auto object-contain"
              />
              <span
                style={{ fontFamily: "var(--font-cairo), sans-serif" }}
                className="border-r border-[#B9A988] pr-3 text-base font-bold text-[#1E4831] sm:text-lg"
              >
                السكن الجامعي
              </span>
            </Link>

            <p className="max-w-md text-sm leading-relaxed text-[#3E5E4D]">
              بيئة سكنية وتعليمية آمنة للطلاب الدوليين في مصر، تجمع بين
              الاستقرار الأكاديمي، والرعاية اليومية، والروح الأخوية الممتدة.
            </p>

            {/* প্রশাসনিক প্রবেশাধিকারের সংক্ষিপ্ত নোট */}
            <div className="inline-flex items-center gap-2.5 rounded-2xl border border-[#D5C9AE] bg-[#FAF7F2] px-4 py-2.5 text-xs font-medium text-[#3E5E4D] shadow-2xs">
              <ShieldCheck className="h-4 w-4 shrink-0 text-[#1E4831]" />
              <span>
                دخول الطلاب والمشرفين يتم عبر رقم الجواز وكلمة المرور المعتمدة
                من الإدارة.
              </span>
            </div>
          </div>

          {/* মাঝের অংশ: روابط سريعة (৩ কলাম) */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-base font-extrabold text-[#1E4831]">
              روابط سريعة
            </h3>
            <ul className="space-y-2.5 text-sm font-medium text-[#3E5E4D]">
              {quickLinks.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="nav-link-underline transition-colors hover:text-[#132F20]"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* বাম পাশ: تواصل معنا ও দ্রুত অ্যাকশন (৪ কলাম) */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-base font-extrabold text-[#1E4831]">
              تواصل معنا
            </h3>

            <ul className="space-y-3 text-sm text-[#3E5E4D]">
              <li className="flex items-start gap-3">
                <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#D5C9AE] bg-[#FAF7F2] text-[#1E4831]">
                  <MapPin className="h-4 w-4" />
                </span>
                <span>مدينة نصر، القاهرة، جمهورية مصر العربية</span>
              </li>

              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#D5C9AE] bg-[#FAF7F2] text-[#1E4831]">
                  <Mail className="h-4 w-4" />
                </span>
                <a
                  href="mailto:housing@wamy-egypt.org"
                  className="hover:text-[#132F20] transition-colors"
                >
                  housing@wamy-egypt.org
                </a>
              </li>

              <li className="flex items-center gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-[#D5C9AE] bg-[#FAF7F2] text-[#1E4831]">
                  <Phone className="h-4 w-4" />
                </span>
                <span dir="ltr" className="text-right">
                  +20 2 0000 0000
                </span>
              </li>
            </ul>

            {/* একক অ্যাকসেন্ট CTA বাটন */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <Link
                href="/signin"
                className="inline-flex items-center justify-center rounded-xl bg-[#DE2F2C] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-[#BD221F] active:bg-[#931815]"
              >
                دخول الأعضاء
              </Link>

              <button
                type="button"
                onClick={scrollToTop}
                aria-label="العودة إلى الأعلى"
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#B9A988] bg-[#FAF7F2] px-4 py-2.5 text-sm font-semibold text-[#1E4831] transition-all hover:bg-[#1E4831] hover:text-[#FAF7F2] cursor-pointer"
              >
                <span>الأعلى</span>
                <ArrowUpLeft className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* নিচের কপিরাইট বার */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-[#C9BC9E] pt-6 text-xs text-[#3E5E4D] sm:flex-row">
          <p>
            © {new Date().getFullYear()} الندوة العالمية للشباب الإسلامي — السكن
            الجامعي. جميع الحقوق محفوظة.
          </p>
          <p className="text-[#657F71]">
            نظام إدارة السكن الطلابي — بوابة الأعضاء
          </p>
        </div>
      </div>
    </footer>
  );
}
