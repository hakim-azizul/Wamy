"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  apiFetch,
  type StudentDetailsBundleResponse,
} from "@/lib/api/api-client";
import { formatDate } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/labels";
import { STUDENT_DETAIL_SECTIONS } from "@/lib/studentDetailsMeta";
import { useDashboardUser } from "../shared/DashboardShell";

export default function StudentOverview() {
  const user = useDashboardUser();
  const [bundle, setBundle] = useState<StudentDetailsBundleResponse | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<StudentDetailsBundleResponse>("/api/student-details/me")
      .then(setBundle)
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل البيانات."));
  }, []);

  if (!user) return null;

  const personal = bundle?.personal;
  const completed = bundle?.completionSummary?.completedSections ?? 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">ملفي ودرجتي</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">ملخص حسابك وبيانات السكن ودرجة المراجعة.</p>
      </div>

      {error && (
        <p role="alert" className="rounded-xl border border-[#DE2F2C]/25 bg-[#FDE8E7] px-4 py-3 text-sm text-[#931815]">
          {error}
        </p>
      )}

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-[#DE2F2C]/25 bg-linear-to-l from-[#FDE8E7] to-[#F9F5EC] p-6">
          <p className="text-xs font-semibold text-[#931815]">درجة المراجعة</p>
          <p className="mt-2 text-4xl font-extrabold text-[#DE2F2C]">{user.score ?? "—"}</p>
        </div>
        <div className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6">
          <p className="text-xs font-semibold text-[#657F71]">الشقة / الغرفة</p>
          <p className="mt-2 text-2xl font-extrabold text-[#1E4831]" dir="ltr">
            {bundle?.user?.flatNumber || bundle?.user?.roomNumber
              ? `${bundle.user.flatNumber ?? "—"} / ${bundle.user.roomNumber ?? "—"}`
              : "—"}
          </p>
        </div>
        <div className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6">
          <p className="text-xs font-semibold text-[#657F71]">اكتمال البيانات</p>
          <p className="mt-2 text-2xl font-extrabold text-[#1E4831]">{completed}/5</p>
        </div>
      </section>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-extrabold text-[#1E4831]">بيانات الحساب</h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
          <InfoRow label="الاسم" value={user.name} />
          <InfoRow label="البريد الإلكتروني" value={user.email} ltr />
          <InfoRow label="الهاتف" value={user.phone ?? "—"} ltr />
          <InfoRow label="الحالة" value={STATUS_LABELS[user.status]} />
          <InfoRow label="أنشأه" value={user.createdBy ?? "—"} />
          <InfoRow label="تاريخ الإنشاء" value={formatDate(user.createdAt)} />
          {personal && (
            <>
              <InfoRow label="الاسم بالعربية" value={personal.fullNameAr} />
              <InfoRow label="رقم الجواز" value={personal.passport} ltr />
              <InfoRow label="الجنسية" value={personal.nationality} />
              <InfoRow label="الجامعة / الرقم الجامعي" value={personal.universityStudentId} ltr />
              <InfoRow label="تاريخ انتهاء الجواز" value={formatDate(personal.passportExpiryDate)} />
              <InfoRow label="تاريخ انتهاء الإقامة" value={formatDate(personal.iqamaExpiryDate)} />
            </>
          )}
        </dl>
      </section>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-[#1E4831]">حالة الأقسام الخمسة</h2>
          <Link
            href="/dashboard/student/profile"
            className="rounded-xl bg-[#1E4831] px-4 py-2 text-xs font-bold text-[#F9F5EC] transition-colors hover:bg-[#132F20]"
          >
            تعبئة البيانات
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {STUDENT_DETAIL_SECTIONS.map((section) => {
            const doc = bundle?.[section.key] as { isCompleted?: boolean } | null;
            const done = Boolean(doc?.isCompleted);
            return (
              <div
                key={section.key}
                className={`rounded-xl border p-4 text-center ${
                  done
                    ? "border-[#1E4831]/20 bg-[#DCE6E0]"
                    : "border-[#D5C9AE] bg-white"
                }`}
              >
                <p className="text-xs font-bold text-[#1E4831]">{section.shortLabel}</p>
                <p className="mt-1 text-xs font-semibold text-[#657F71]">
                  {done ? "مكتمل" : "غير مكتمل"}
                </p>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

function InfoRow({ label, value, ltr = false }: { label: string; value: string; ltr?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#D5C9AE]/70 pb-2">
      <dt className="text-xs font-semibold text-[#3E5E4D]">{label}</dt>
      <dd dir={ltr ? "ltr" : undefined} className="text-sm font-bold text-[#1E4831]">
        {value}
      </dd>
    </div>
  );
}
