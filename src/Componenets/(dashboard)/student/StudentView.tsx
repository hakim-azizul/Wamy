"use client";

import { formatDate } from "@/lib/format";
import { STATUS_LABELS } from "@/lib/labels";
import { useDashboardUser } from "../shared/DashboardShell";

export default function StudentView() {
  const user = useDashboardUser();
  const profile = user?.studentProfile;

  if (!user || !profile) {
    return (
      <p className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 text-sm text-[#3E5E4D]">
        لا توجد بيانات ملف شخصي مرتبطة بهذا الحساب.
      </p>
    );
  }

  const rows: { label: string; value: string; ltr?: boolean }[] = [
    { label: "اسم الطالب", value: profile.name },
    { label: "اسم الأب", value: profile.fathersName },
    { label: "رقم الجواز", value: profile.passportNumber, ltr: true },
    { label: "تاريخ انتهاء الجواز", value: formatDate(profile.passportExpiryDate) },
    { label: "تاريخ انتهاء الإقامة", value: formatDate(profile.residencePermitExpiryDate) },
    { label: "الدولة / الجنسية", value: profile.countryOrNationality },
    { label: "الجامعة", value: profile.university },
    { label: "الكلية", value: profile.faculty },
    { label: "القسم", value: profile.department },
    { label: "السنة الأكاديمية", value: profile.academicYear },
    { label: "رقم الشقة", value: profile.apartmentNumber },
    { label: "رقم الغرفة", value: profile.roomNumber },
    { label: "البريد الإلكتروني", value: user.email, ltr: true },
    { label: "رقم الهاتف", value: user.phone ?? "—", ltr: true },
    { label: "الحالة", value: STATUS_LABELS[user.status] },
    { label: "تاريخ إنشاء الحساب", value: formatDate(user.createdAt) },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">ملفي الشخصي</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          بياناتك المسجلة في السكن الجامعي ودرجة المراجعة الخاصة بك.
        </p>
      </div>

      <section className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-[#DE2F2C]/25 bg-linear-to-l from-[#FDE8E7] to-[#F9F5EC] p-6 shadow-sm sm:flex-row sm:items-center">
        <div>
          <p className="text-sm font-bold text-[#931815]">درجة المراجعة</p>
          <p className="mt-1 text-xs text-[#657F71]">
            تبدأ من الإعداد المحدد من الإدارة وتُحدَّث من قِبل المكتب المختص.
          </p>
        </div>
        <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-[#DE2F2C]/25 bg-white text-3xl font-extrabold text-[#DE2F2C]">
          {profile.score}
        </div>
      </section>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-extrabold text-[#1E4831]">البيانات التفصيلية</h2>
        <dl className="grid grid-cols-1 gap-x-8 gap-y-4 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="flex items-center justify-between gap-4 border-b border-[#D5C9AE]/70 pb-3"
            >
              <dt className="text-sm font-semibold text-[#3E5E4D]">{row.label}</dt>
              <dd dir={row.ltr ? "ltr" : undefined} className="text-sm font-bold text-[#1E4831]">
                {row.value}
              </dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
