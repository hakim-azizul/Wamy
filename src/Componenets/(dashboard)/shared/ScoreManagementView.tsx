"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ArrowUpLeft } from "lucide-react";
import {
  apiFetch,
  type StudentDetailsBundleResponse,
  type UsersResponse,
} from "@/lib/api/api-client";
import WamyLoader from "@/Componenets/shared/WamyLoader";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/lib/labels";
import type { IUser } from "@/lib/types/users";
import { FormMessage } from "./FormFields";

const SORT_OPTIONS = [
  { value: "score-desc", label: "الدرجة (الأعلى أولًا)" },
  { value: "score-asc", label: "الدرجة (الأقل أولًا)" },
  { value: "name", label: "الاسم" },
  { value: "room", label: "رقم الغرفة" },
  { value: "flat", label: "رقم الشقة" },
  { value: "nationality", label: "الجنسية" },
] as const;

type SortKey = (typeof SORT_OPTIONS)[number]["value"];

function isSortKey(value: string | null): value is SortKey {
  return SORT_OPTIONS.some((option) => option.value === value);
}

/** Compact, role-scoped student cards for manager / supervisor نظام النقاط. */
export default function ScoreManagementView() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const rawSort = searchParams.get("sort");
  const sort: SortKey = isSortKey(rawSort) ? rawSort : "score-desc";

  const [students, setStudents] = useState<IUser[]>([]);
  const [nationalityById, setNationalityById] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiFetch<UsersResponse>("/api/users");
      const list = data.users.filter((user) => user.role === "student");
      setStudents(list);

      // Nationality comes from the existing student-details bundle API.
      const entries = await Promise.all(
        list.map(async (student) => {
          try {
            const bundle = await apiFetch<StudentDetailsBundleResponse>(
              `/api/student-details/${student._id}`,
            );
            return [student._id, bundle.personal?.nationality ?? "—"] as const;
          } catch {
            return [student._id, "—"] as const;
          }
        }),
      );
      setNationalityById(Object.fromEntries(entries));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل الطلاب.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadStudents();
  }, [loadStudents]);

  /** Sort state lives in the URL so it survives reloads and back/forward. */
  function changeSort(next: SortKey) {
    const params = new URLSearchParams(searchParams.toString());
    if (next === "score-desc") {
      params.delete("sort");
    } else {
      params.set("sort", next);
    }
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }

  const sorted = useMemo(() => {
    const list = [...students];
    list.sort((a, b) => {
      switch (sort) {
        case "score-asc":
          return (a.score ?? 0) - (b.score ?? 0);
        case "name":
          return a.name.localeCompare(b.name, "ar");
        case "room":
          return (a.roomNumber ?? "").localeCompare(b.roomNumber ?? "", "ar");
        case "flat":
          return (a.flatNumber ?? "").localeCompare(b.flatNumber ?? "", "ar");
        case "nationality":
          return (nationalityById[a._id] ?? "").localeCompare(nationalityById[b._id] ?? "", "ar");
        default:
          return (b.score ?? 0) - (a.score ?? 0);
      }
    });
    return list;
  }, [students, sort, nationalityById]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">نظام النقاط</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          اختر طالبًا لعرض درجته وسجل النقاط الخاص به.
        </p>
      </div>

      {error && <FormMessage text={error} tone="error" />}

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-[#1E4831]">الطلاب ({students.length})</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="points-sort" className="text-xs font-bold text-[#657F71]">
              ترتيب حسب:
            </label>
            <select
              id="points-sort"
              value={sort}
              onChange={(event) => changeSort(event.target.value as SortKey)}
              className="rounded-lg border border-[#D5C9AE] bg-white px-3 py-1.5 text-xs font-bold text-[#1E4831] outline-none focus:border-[#1E4831]"
            >
              {SORT_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {loading ? (
          <WamyLoader label="جاري تحميل الطلاب..." variant="compact" />
        ) : sorted.length === 0 ? (
          <p className="py-8 text-center text-sm text-[#657F71]">لا يوجد طلاب بعد.</p>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sorted.map((student) => (
              <Link
                key={student._id}
                href={`/dashboard/points/${student._id}`}
                className="group rounded-2xl border border-[#D5C9AE] bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#1E4831] hover:shadow-md"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#DCE6E0] text-base font-extrabold text-[#1E4831]">
                      {student.name.charAt(0)}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-extrabold text-[#1E4831]">{student.name}</p>
                      <p dir="ltr" className="truncate text-[11px] text-[#657F71]">{student.email}</p>
                    </div>
                  </div>
                  <span className="shrink-0 rounded-full border border-[#DE2F2C]/25 bg-[#FDE8E7] px-2.5 py-1 text-sm font-extrabold text-[#DE2F2C]" dir="ltr">
                    {student.score ?? "—"}
                  </span>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-[#D5C9AE]/70 pt-3">
                  <span className="rounded-full border border-[#1E4831]/20 bg-[#EBE2CA] px-2.5 py-1 text-[11px] font-bold text-[#1E4831]">
                    {nationalityById[student._id] || "—"}
                  </span>
                  <span className="rounded-full border border-[#D5C9AE] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#657F71]" dir="ltr">
                    غرفة {student.roomNumber ?? "—"} · شقة {student.flatNumber ?? "—"}
                  </span>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${STATUS_BADGE_CLASSES[student.status]}`}>
                    {STATUS_LABELS[student.status]}
                  </span>
                  <ArrowUpLeft className="mr-auto h-4 w-4 text-[#657F71] transition-colors group-hover:text-[#DE2F2C]" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
