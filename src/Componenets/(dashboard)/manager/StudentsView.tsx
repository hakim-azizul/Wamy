"use client";

import { useEffect, useState } from "react";
import { apiFetch, type UsersResponse } from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";
import { FormMessage } from "../shared/FormFields";
import StudentDirectory from "../shared/StudentDirectory";

export default function ManagerStudentsView() {
  const [students, setStudents] = useState<IUser[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<UsersResponse>("/api/users")
      .then((data) => setStudents(data.users.filter((user) => user.role === "student")))
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل الطلاب."));
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">دليل الطلاب</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          عرض جميع الطلاب وتفقد ملفاتهم المكوّنة من خمسة أقسام.
        </p>
      </div>

      {error && <FormMessage text={error} tone="error" />}

      <StudentDirectory students={students} />
    </div>
  );
}
