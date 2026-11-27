"use client";

import { useEffect, useState } from "react";
import {
  apiFetch,
  type ScoreTransactionsResponse,
} from "@/lib/api/api-client";
import { FormMessage } from "../shared/FormFields";
import ScoreHistory from "../shared/ScoreHistory";
import ScoreMilestoneCard from "../shared/ScoreMilestoneCard";
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
          رصيدك الحالي ومسار التقدم وسجل جميع الزيادات والخصومات من الأحدث إلى الأقدم.
        </p>
      </div>

      {/* Unified score + status + horizontal milestone track, directly above the history. */}
      <ScoreMilestoneCard score={score} />

      {error && <FormMessage text={error} tone="error" />}

      <ScoreHistory transactions={transactions} />
    </div>
  );
}
