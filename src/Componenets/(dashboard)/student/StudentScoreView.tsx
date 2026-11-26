"use client";

import { useEffect, useState } from "react";
import {
  apiFetch,
  type ScoreTransactionsResponse,
} from "@/lib/api/api-client";
import { FormMessage } from "../shared/FormFields";
import ScoreHistory from "../shared/ScoreHistory";
import ScoreRoadmap from "../shared/ScoreRoadmap";
import { useDashboardUser } from "../shared/DashboardShell";

export default function StudentScoreView() {
  const user = useDashboardUser();
  const [transactions, setTransactions] = useState<ScoreTransactionsResponse["transactions"]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch<ScoreTransactionsResponse>("/api/scores")
      .then((data) => setTransactions(data.transactions))
      .catch((err) => setError(err instanceof Error ? err.message : "تعذر تحميل سجل النقاط."));
  }, []);

  if (!user) return null;
  const score = user.score ?? transactions[0]?.newScore ?? 100;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-[#1E4831] sm:text-3xl">نظام النقاط</h1>
        <p className="mt-1 text-sm text-[#3E5E4D]">
          رصيدك الحالي وسجل جميع الزيادات والخصومات مرتبة من الأحدث إلى الأقدم.
        </p>
      </div>

      <div className="rounded-2xl border border-[#1E4831]/20 bg-linear-to-l from-[#DCE6E0] to-[#F9F5EC] p-8 shadow-sm">
        <p className="text-sm font-bold text-[#1E4831]">رصيد النقاط الحالي</p>
        <p className="mt-2 text-6xl font-extrabold text-[#1E4831]" dir="ltr">{score}</p>
        <p className="mt-2 text-xs text-[#657F71]">كسب الزيادات، وتجنب المخالفات للحفاظ على رصيدك.</p>
      </div>

      {error && <FormMessage text={error} tone="error" />}

      <ScoreHistory transactions={transactions} />
      <ScoreRoadmap score={score} />
    </div>
  );
}
