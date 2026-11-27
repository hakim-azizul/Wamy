"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowRight, ClipboardList } from "lucide-react";
import {
  apiFetch,
  type ScoreAdjustResponse,
  type ScoreTransactionsResponse,
  type StudentDetailsBundleResponse,
  type UsersResponse,
} from "@/lib/api/api-client";
import {
  STATUS_BADGE_CLASSES,
  STATUS_LABELS,
} from "@/lib/labels";
import type { IUser } from "@/lib/types/users";
import { useDashboardUser } from "./DashboardShell";
import { FormMessage } from "./FormFields";
import ScoreEvaluationModal from "./ScoreEvaluationModal";
import ScoreHistory from "./ScoreHistory";
import ScoreMilestoneCard from "./ScoreMilestoneCard";

/** Dedicated office view for one student's points meter + transaction history. */
export default function StudentPointsDetailView() {
  const { studentId } = useParams<{ studentId: string }>();
  const actor = useDashboardUser();
  const [student, setStudent] = useState<IUser | null>(null);
  const [nationality, setNationality] = useState("—");
  const [transactions, setTransactions] = useState<ScoreTransactionsResponse["transactions"]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [evaluating, setEvaluating] = useState(false);

  useEffect(() => {
    let active = true;

    Promise.all([
      apiFetch<UsersResponse>("/api/users"),
      apiFetch<ScoreTransactionsResponse>(`/api/scores?studentUserId=${studentId}`),
      apiFetch<StudentDetailsBundleResponse>(`/api/student-details/${studentId}`),
    ])
      .then(([users, history, bundle]) => {
        if (!active) return;
        setStudent(users.users.find((user) => user._id === studentId) ?? null);
        setTransactions(history.transactions);
        setNationality(bundle.personal?.nationality ?? "—");
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : "تعذر تحميل بيانات الطالب.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [studentId]);

  /** Quiet refresh after an evaluation — no full-page loading state. */
  const refresh = useCallback(async () => {
    try {
      const [users, history] = await Promise.all([
        apiFetch<UsersResponse>("/api/users"),
        apiFetch<ScoreTransactionsResponse>(`/api/scores?studentUserId=${studentId}`),
      ]);
      setStudent(users.users.find((user) => user._id === studentId) ?? null);
      setTransactions(history.transactions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحديث بيانات النقاط.");
    }
  }, [studentId]);

  function handleEvaluated(response: ScoreAdjustResponse) {
    const newScore = response.student.score ?? response.transaction.newScore;
    setStudent((current) => (current ? { ...current, score: newScore } : current));
    setSuccess(`تم حفظ التقييم — الدرجة الحالية: ${newScore}.`);
    void refresh();
  }

  const backHref =
    actor?.role === "manager" ? "/dashboard/manager/scores" : "/dashboard/supervisor/scores";
  const canEvaluate = actor?.role === "manager" || actor?.role === "supervisor";

  if (loading) {
    return <p className="text-sm text-[#657F71]">جارٍ تحميل بيانات النقاط...</p>;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#657F71] transition-colors hover:text-[#DE2F2C]"
        >
          العودة إلى نظام النقاط
          <ArrowRight className="h-4 w-4" />
        </Link>
        {canEvaluate && (
          <button
            type="button"
            onClick={() => {
              setSuccess("");
              setEvaluating(true);
            }}
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-[#1E4831] px-5 py-2.5 text-sm font-bold text-[#F9F5EC] transition-colors hover:bg-[#132F20]"
          >
            <ClipboardList className="h-4 w-4" />
            تقييم
          </button>
        )}
      </div>

      {error && <FormMessage text={error} tone="error" />}
      {success && <FormMessage text={success} tone="success" />}

      {student && (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#D5C9AE] bg-[#EBE2CA] px-6 py-5">
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#1E4831] text-lg font-extrabold text-[#F9F5EC]">
              {student.name.charAt(0)}
            </span>
            <div>
              <h1 className="text-lg font-extrabold text-[#1E4831]">نقاط الطالب: {student.name}</h1>
              <p dir="ltr" className="text-xs text-[#657F71]">{student.email}</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-[#1E4831]/20 bg-white px-2.5 py-1 text-[11px] font-bold text-[#1E4831]">
                  {nationality}
                </span>
                <span className="rounded-full border border-[#D5C9AE] bg-white px-2.5 py-1 text-[10px] font-semibold text-[#657F71]" dir="ltr">
                  غرفة {student.roomNumber ?? "—"} · شقة {student.flatNumber ?? "—"}
                </span>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${STATUS_BADGE_CLASSES[student.status]}`}>
                  {STATUS_LABELS[student.status]}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      <ScoreMilestoneCard
        score={student?.score ?? transactions[0]?.newScore ?? 100}
      />

      <ScoreHistory
        transactions={transactions}
        showActor={actor?.role === "manager"}
      />

      {evaluating && (
        <ScoreEvaluationModal
          studentUserId={studentId}
          studentName={student?.name}
          onClose={() => setEvaluating(false)}
          onSuccess={handleEvaluated}
        />
      )}
    </div>
  );
}
