"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, type UsersResponse } from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";
import { FormMessage } from "../shared/FormFields";
import StudentDirectory from "../shared/StudentDirectory";

export default function SupervisorStudentsView() {
  const [students, setStudents] = useState<IUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<UsersResponse>("/api/users")
      .then((data) => setStudents(data.users.filter((user) => user.role === "student")))
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل الطلاب."));
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">الطلاب</h1>
          <p className="mt-1 text-sm text-[#3E5E4D]">
            عرض الطلاب ونسبة اكتمال ملفاتهم (من 5 أقسام) وتفقد بياناتهم.
          </p>
        </div>
        <Link
          href="/dashboard/supervisor/students/new"
          className="rounded-xl bg-[#DE2F2C] px-5 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#BD221F]"
        >
          إضافة طالب جديد
        </Link>
      </div>

      {error && <FormMessage text={error} tone="error" />}

      <StudentDirectory
        students={students}
        showCompletion
        onDeleted={(id: string) => {
          setStudents((current) => current.filter((student) => student._id !== id));
        }}
      />
    </div>
  );
}
