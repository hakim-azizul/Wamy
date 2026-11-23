import type { Metadata } from "next";
import Link from "next/link";
import SignInForm from "@/Componenets/(root)/shared/SignInForm";

export const metadata: Metadata = {
  title: "دخول الأعضاء | السكن الجامعي",
  description: "تسجيل الدخول إلى بوابة إدارة السكن الجامعي",
};

export default function SignInPage() {
  return (
    <section dir="rtl" className="flex min-h-[70vh] items-center justify-center bg-[#F4EFE2] px-4 py-16">
      <div className="w-full max-w-md rounded-3xl border border-[#D5C9AE] bg-[#F9F5EC] p-8 shadow-lg sm:p-10">
        <div className="mb-8 text-center">
          <span className="inline-block rounded-full bg-[#DCE6E0] px-3.5 py-1 text-xs font-bold text-[#1E4831]">
            بوابة الأعضاء
          </span>
          <h1 className="mt-4 text-2xl font-extrabold text-[#1E4831] sm:text-3xl">
            دخول الأعضاء
          </h1>
          <p className="mt-2 text-sm text-[#3E5E4D]">
            أدخل بريدك الإلكتروني وكلمة المرور المعتمدة من الإدارة.
          </p>
        </div>

        <SignInForm />

        <div className="mt-6 border-t border-[#D5C9AE] pt-5 text-center">
          <Link href="/" className="text-sm font-semibold text-[#1E4831] hover:text-[#DE2F2C]">
            العودة إلى الصفحة الرئيسية
          </Link>
        </div>
      </div>
    </section>
  );
}
