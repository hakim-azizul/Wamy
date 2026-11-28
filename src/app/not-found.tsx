import Link from "next/link";
import { ArrowLeft, Home, LayoutDashboard } from "lucide-react";
import WMark from "@/Componenets/shared/WMark";

export default function NotFound() {
  return (
    <main
      dir="rtl"
      className="flex min-h-screen items-center justify-center bg-linear-to-b from-[#EBE2CA] via-[#F4EFE2] to-[#EBE2CA] px-4 py-16 sm:px-6"
    >
      <section className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-[#D5C9AE] bg-[#F9F5EC] p-8 text-center shadow-[0_18px_60px_rgba(30,72,49,0.10)] sm:p-12">
        <span className="pointer-events-none absolute -top-16 -left-14 h-44 w-44 rounded-full bg-[#DCE6E0]/50 blur-3xl" />
        <span className="pointer-events-none absolute -bottom-20 -right-14 h-44 w-44 rounded-full bg-[#FDE8E7]/40 blur-3xl" />

        <div className="relative flex flex-col items-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-2xl border border-[#D5C9AE] bg-white/85 shadow-sm">
            <WMark className="h-12 w-18" />
          </div>

          <p
            dir="ltr"
            className="mt-6 text-6xl font-extrabold tracking-tight text-[#DE2F2C]/85"
          >
            404
          </p>
          <h1 className="mt-2 text-2xl font-extrabold text-[#1E4831] sm:text-3xl">
            لم نجد هذه الغرفة
          </h1>
          <p className="mt-3 max-w-md text-sm leading-relaxed text-[#3E5E4D] sm:text-base">
            يبدو أن الصفحة أو المسار الذي طلبته غير موجود في السكن الجامعي.
            يمكنك العودة إلى الرئيسية أو فتح لوحة التحكم الخاصة بك.
          </p>

          <div className="mt-8 flex w-full flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#DE2F2C] px-6 py-3 text-sm font-bold text-white shadow-sm transition-all hover:bg-[#BD221F] active:bg-[#931815]"
            >
              <Home className="h-4 w-4" />
              الصفحة الرئيسية
            </Link>
            <Link
              href="/dashboard"
              className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-[#1E4831]/30 bg-white px-6 py-3 text-sm font-bold text-[#1E4831] transition-all hover:border-[#1E4831] hover:bg-[#DCE6E0]/60"
            >
              <LayoutDashboard className="h-4 w-4" />
              لوحة التحكم
            </Link>
          </div>

          <Link
            href="/signin"
            className="mt-5 inline-flex items-center gap-1.5 text-xs font-bold text-[#657F71] transition-colors hover:text-[#DE2F2C]"
          >
            تسجيل الدخول
            <ArrowLeft className="h-3.5 w-3.5" />
          </Link>
        </div>
      </section>
    </main>
  );
}
