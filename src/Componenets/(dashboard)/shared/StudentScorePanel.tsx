"use client";

import { useCallback, useEffect, useState } from "react";
import {
  apiFetch,
  type ScoreAdjustResponse,
  type ScoreTransactionsResponse,
  type UsersResponse,
} from "@/lib/api/api-client";
import type { IUser } from "@/lib/types/users";
import ScoreAdjustForm from "./ScoreAdjustForm";
import ScoreHistory from "./ScoreHistory";
import ScoreMilestoneCard from "./ScoreMilestoneCard";
import { FormMessage } from "./FormFields";

/** Score tab used on the office CV page: unified score/milestone card, adjust form, history. */
export default function StudentScorePanel({
  studentUserId,
  student,
}: {
  studentUserId: string;
  student?: Pick<IUser, "name" | "email" | "score"> | null;
}) {
  const [score, setScore] = useState<number | null>(student?.score ?? null);
  const [transactions, setTransactions] = useState<ScoreTransactionsResponse["transactions"]>([]);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const data = await apiFetch<ScoreTransactionsResponse>(
        `/api/scores?studentUserId=${studentUserId}`,
      );
      setTransactions(data.transactions);
      if (data.transactions.length) setScore(data.transactions[0].newScore);
    } catch (err) {
      setError(err instanceof Error ? err.message : "تعذر تحميل سجل النقاط.");
    }
  }, [studentUserId]);

  useEffect(() => {
    void load();
    apiFetch<UsersResponse>("/api/users")
      .then((data) => {
        const found = data.users.find((item) => item._id === studentUserId);
        if (found && typeof found.score === "number") setScore(found.score);
      })
      .catch(() => undefined);
  }, [load, studentUserId]);

  function onAdjusted(response: ScoreAdjustResponse) {
    setScore(response.student.score ?? response.transaction.newScore);
    void load();
  }

  return (
    <div className="space-y-6">
      <ScoreMilestoneCard score={score ?? student?.score ?? 100} />

      {error && <FormMessage text={error} tone="error" />}

      <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
        <h2 className="mb-5 text-lg font-extrabold text-[#1E4831]">تعديل الدرجة</h2>
        <ScoreAdjustForm
          studentUserId={studentUserId}
          studentLabel={student?.name}
          onSuccess={onAdjusted}
        />
      </section>

      <ScoreHistory transactions={transactions} />
    </div>
  );
}
