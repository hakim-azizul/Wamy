"use client";

import {
  formatFieldValue,
  STUDENT_DETAIL_SECTIONS,
} from "@/lib/studentDetailsMeta";
import type { StudentFullDetailsBundle } from "@/lib/types/studentDetails";

export default function StudentDetailsViewer({
  bundle,
  showCompletion = true,
}: {
  bundle: StudentFullDetailsBundle;
  showCompletion?: boolean;
}) {
  const completed =
    bundle.completionSummary?.completedSections ??
    STUDENT_DETAIL_SECTIONS.filter(
      (section) =>
        (bundle[section.key] as { isCompleted?: boolean } | null)?.isCompleted,
    ).length;

  return (
    <div className="space-y-6">
      {showCompletion && (
        <div className="flex items-center justify-between rounded-2xl border border-[#1E4831]/20 bg-[#DCE6E0] px-5 py-4">
          <span className="text-sm font-bold text-[#1E4831]">اكتمال الملف الشخصي</span>
          <span className="rounded-full border border-[#1E4831]/20 bg-white px-4 py-1.5 text-sm font-extrabold text-[#1E4831]">
            {completed}/5
          </span>
        </div>
      )}

      {bundle.user && (
        <section className="rounded-2xl border border-[#1E4831]/20 bg-[#DCE6E0]/50 p-6 shadow-sm">
          <h2 className="mb-5 border-b border-[#1E4831]/20 pb-3 text-lg font-extrabold text-[#1E4831]">
            بيانات الحساب ( Better Auth user )
          </h2>
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
            {[
              { label: "الاسم", value: bundle.user.name, ltr: false },
              { label: "البريد الإلكتروني", value: bundle.user.email, ltr: true },
              { label: "رقم الغرفة", value: bundle.user.roomNumber, ltr: true },
              { label: "رقم الشقة", value: bundle.user.flatNumber, ltr: true },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between gap-4 border-b border-[#D5C9AE]/60 pb-2"
              >
                <dt className="text-xs font-semibold text-[#3E5E4D]">{row.label}</dt>
                <dd dir={row.ltr ? "ltr" : undefined} className="text-sm font-bold text-[#1E4831]">
                  {row.value || "—"}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      {STUDENT_DETAIL_SECTIONS.map((section) => {
        const doc = bundle[section.key] as unknown as Record<string, unknown> | null;
        const done = Boolean(doc?.isCompleted);

        return (
          <section
            key={section.key}
            className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm"
          >
            <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#D5C9AE] pb-3">
              <h2 className="text-lg font-extrabold text-[#1E4831]">{section.label}</h2>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-bold ${
                  done
                    ? "border-[#1E4831]/20 bg-[#DCE6E0] text-[#1E4831]"
                    : "border-[#D5C9AE] bg-white text-[#657F71]"
                }`}
              >
                {done ? "مكتمل" : "غير مكتمل"}
              </span>
            </div>

            {!doc ? (
              <p className="text-sm text-[#657F71]">لم يتم إدخال بيانات هذا القسم بعد.</p>
            ) : (
              <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-2">
                {section.fields.map((field) => (
                  <div
                    key={field.name}
                    className="flex items-start justify-between gap-4 border-b border-[#D5C9AE]/60 pb-2"
                  >
                    <dt className="text-xs font-semibold text-[#3E5E4D]">{field.label}</dt>
                    <dd
                      dir={field.ltr ? "ltr" : undefined}
                      className="max-w-[60%] text-left text-sm font-bold text-[#1E4831]"
                    >
                      {formatFieldValue(field, doc[field.name])}
                    </dd>
                  </div>
                ))}
              </dl>
            )}
          </section>
        );
      })}
    </div>
  );
}
