"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  apiFetch,
  type StudentDetailsBundleResponse,
  type UsersResponse,
} from "@/lib/api/api-client";
import { ROLE_LABELS } from "@/lib/labels";
import type { IUser } from "@/lib/types/users";
import { useDashboardUser } from "./DashboardShell";

export default function DashboardOverview() {
  const user = useDashboardUser();
  const [users, setUsers] = useState<IUser[]>([]);
  const [bundle, setBundle] = useState<StudentDetailsBundleResponse | null>(null);

  useEffect(() => {
    if (!user) return;

    if (user.role === "manager" || user.role === "supervisor") {
      apiFetch<UsersResponse>("/api/users")
        .then((data) => setUsers(data.users))
        .catch(() => setUsers([]));
    } else {
      apiFetch<StudentDetailsBundleResponse>("/api/student-details/me")
        .then(setBundle)
        .catch(() => setBundle(null));
    }
  }, [user]);

  if (!user) return null;

  const quickLinks =
    user.role === "manager"
      ? [
          { href: "/dashboard/manager/supervisors", label: "إنشاء مشرف جديد" },
          { href: "/dashboard/manager/users", label: "عرض كل المستخدمين" },
          { href: "/dashboard/manager/students", label: "ملفات الطلاب" },
        ]
      : user.role === "supervisor"
        ? [
            { href: "/dashboard/supervisor/students/new", label: "إضافة طالب جديد" },
            { href: "/dashboard/supervisor/students", label: "قائمة الطلاب" },
          ]
        : [
            { href: "/dashboard/student/profile", label: "تعبئة بياناتي (5 أقسام)" },
            { href: "/dashboard/student/overview", label: "عرض ملفي ودرجتي" },
          ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">
          مرحبًا، {user.name}
        </h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          لوحة {ROLE_LABELS[user.role]} — نظرة عامة على حسابك وبيانات السكن.
        </p>
      </div>

      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {user.role === "manager" && (
          <>
            <SummaryCard label="إجمالي المستخدمين" value={users.length} />
            <SummaryCard label="المشرفون" value={users.filter((u) => u.role === "supervisor").length} />
            <SummaryCard label="الطلاب" value={users.filter((u) => u.role === "student").length} />
          </>
        )}

        {user.role === "supervisor" && (
          <>
            <SummaryCard label="الطلاب المسجلون" value={users.length} />
            <SummaryCard label="حسابات نشطة" value={users.filter((u) => u.status === "active").length} />
            <SummaryCard label="تم إنشاؤها بواسطتك" value={users.filter((u) => u.createdBy === user.name).length} />
          </>
        )}

        {user.role === "student" && (
          <>
            <SummaryCard label="درجة المراجعة" value={user.score ?? "—"} accent />
            <SummaryCard
              label="البيانات المكتملة"
              value={`${bundle?.completionSummary?.completedSections ?? 0}/5`}
            />
            <SummaryCard
              label="الشقة / الغرفة"
              value={
                bundle?.user?.flatNumber || bundle?.user?.roomNumber
                  ? `${bundle.user.flatNumber ?? "—"} / ${bundle.user.roomNumber ?? "—"}`
                  : "—"
              }
            />
          </>
        )}
      </section>

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-extrabold text-[#1E4831]">إجراءات سريعة</h2>
        <div className="flex flex-wrap gap-3">
          {quickLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-[#1E4831]/20 bg-white px-5 py-2.5 text-sm font-bold text-[#1E4831] transition-colors hover:border-[#DE2F2C] hover:text-[#DE2F2C]"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string | number;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl border p-6 shadow-sm ${
        accent
          ? "border-[#DE2F2C]/25 bg-linear-to-l from-[#FDE8E7] to-[#F9F5EC]"
          : "border-[#D5C9AE] bg-[#F9F5EC]"
      }`}
    >
      <p className="text-xs font-semibold text-[#657F71]">{label}</p>
      <p className={`mt-2 text-3xl font-extrabold ${accent ? "text-[#DE2F2C]" : "text-[#1E4831]"}`}>
        {value}
      </p>
    </div>
  );
}
