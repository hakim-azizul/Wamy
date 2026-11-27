"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  apiFetch,
  type ScoreTransactionsResponse,
  type UsersResponse,
} from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";
import { FormMessage } from "./FormFields";
import ScoreAdjustForm from "./ScoreAdjustForm";
import ScoreHistory from "./ScoreHistory";
import ScoreMilestoneCard from "./ScoreMilestoneCard";

type SortKey = "score-desc" | "score-asc" | "name" | "room" | "flat";

export default function ScoreManagementView() {
  const [students, setStudents] = useState<IUser[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState<SortKey>("score-desc");
  const [transactions, setTransactions] = useState<ScoreTransactionsResponse["transactions"]>([]);
  const [error, setError] = useState("");

  const loadStudents = useCallback(async () => {
    try {
      const data = await apiFetch<UsersResponse>("/api/users");
      setStudents(data.users.filter((user) => user.role === "student"));
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل الطلاب.");
    }
  }, []);

  const loadTransactions = useCallback(async (userId: string | null) => {
    try {
      const path = userId ? `/api/scores?studentUserId=${userId}` : "/api/scores";
      const data = await apiFetch<ScoreTransactionsResponse>(path);
      setTransactions(data.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل سجل النقاط.");
    }
  }, []);

  useEffect(() => {
    void loadStudents();
    void loadTransactions(null);
  }, [loadStudents, loadTransactions]);

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
        default:
          return (b.score ?? 0) - (a.score ?? 0);
      }
    });
    return list;
  }, [students, sort]);

  const selected = students.find((student) => student._id === selectedId) ?? null;

  function selectStudent(id: string) {
    setSelectedId(id);
    void loadTransactions(id);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">نظام النقاط</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          إدارة درجات الطلاب، وعرض سجل الزيادات والخصومات مع درجات المخالفات.
        </p>
      </div>

      {error && <FormMessage text={error} tone="error" />}

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-extrabold text-[#1E4831]">الطلاب ({students.length})</h2>
          <div className="flex items-center gap-2">
            <label htmlFor="score-sort" className="text-xs font-bold text-[#657F71]">ترتيب حسب:</label>
            <select
              id="score-sort"
              value={sort}
              onChange={(event) => setSort(event.target.value as SortKey)}
              className="rounded-lg border border-[#D5C9AE] bg-white px-3 py-1.5 text-xs font-bold text-[#1E4831]"
            >
              <option value="score-desc">الدرجة (الأعلى أولًا)</option>
              <option value="score-asc">الدرجة (الأقل أولًا)</option>
              <option value="name">الاسم</option>
              <option value="room">رقم الغرفة</option>
              <option value="flat">رقم الشقة</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sorted.map((student) => (
            <button
              key={student._id}
              type="button"
              onClick={() => selectStudent(student._id)}
              className={`cursor-pointer rounded-xl border px-4 py-3 text-right transition-colors ${
                selectedId === student._id
                  ? "border-[#1E4831] bg-[#DCE6E0]"
                  : "border-[#D5C9AE] bg-white hover:border-[#1E4831]"
              }`}
            >
              <p className="text-sm font-extrabold text-[#1E4831]">{student.name}</p>
              <div className="mt-1 flex items-center justify-between gap-2">
                <span dir="ltr" className="text-[11px] text-[#657F71]">{student.email}</span>
                <span dir="ltr" className="text-sm font-extrabold text-[#DE2F2C]">
                  {student.score ?? "—"}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-[#657F71]" dir="ltr">
                غرفة {student.roomNumber ?? "—"} / شقة {student.flatNumber ?? "—"}
              </p>
            </button>
          ))}
        </div>
      </section>

      {selected && (
        <section className="rounded-2xl border border-[#1E4831]/20 bg-[#EBE2CA] p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-extrabold text-[#1E4831]">
            تعديل درجة: {selected.name}
          </h2>
          <ScoreAdjustForm
            studentUserId={selected._id}
            onSuccess={() => {
              void loadStudents();
              void loadTransactions(selected._id);
            }}
          />
        </section>
      )}

      <ScoreMilestoneCard score={selected?.score ?? 100} />

      <ScoreHistory transactions={transactions} />
    </div>
  );
}
