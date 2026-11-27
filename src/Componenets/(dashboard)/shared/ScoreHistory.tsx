"use client";

import { ArrowDownLeft, ArrowUpRight } from "lucide-react";
import { formatDate } from "@/lib/format";
import {
  severityBadgeClass,
  SEVERITY_LABELS,
  transactionTone,
} from "@/lib/scoreSystem";
import type { ScoreTransaction, ViolationSeverity } from "@/lib/types/scores";

export default function ScoreHistory({
  transactions,
  showActor = false,
}: {
  transactions: ScoreTransaction[];
  /** Manager-only: render who made the change. Never enabled for student/supervisor. */
  showActor?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3 border-b border-[#D5C9AE] pb-3">
        <h2 className="text-lg font-extrabold text-[#1E4831]">سجل النقاط</h2>
        <span className="rounded-full border border-[#1E4831]/20 bg-white px-3 py-1 text-xs font-bold text-[#1E4831]">
          {transactions.length} عملية
        </span>
      </div>

      {transactions.length === 0 ? (
        <p className="py-6 text-center text-sm text-[#657F71]">لا توجد عمليات على الدرجة بعد.</p>
      ) : (
        <div className="space-y-3" dir="rtl">
          {transactions.map((item) => {
            const increase = item.delta > 0;
            const severity = item.violationSeverity as ViolationSeverity | null;
            return (
              <div
                key={item._id}
                className={`rounded-xl border px-4 py-3 shadow-sm ${transactionTone(item.delta, severity)}`}
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-current/20 bg-white/70">
                      {increase ? (
                        <ArrowUpRight className="h-4 w-4" />
                      ) : (
                        <ArrowDownLeft className="h-4 w-4" />
                      )}
                    </span>
                    <div className="space-y-1">
                      <p className="text-sm font-extrabold">{item.reason}</p>
                      {showActor && (
                        <>
                          <p className="text-xs opacity-80">
                            {item.actorName || item.actorEmail} —{" "}
                            {item.actorRole === "manager" ? "مدير" : "مشرف"}
                          </p>
                          {item.actorEmail && (
                            <p dir="ltr" className="text-[11px] opacity-70">
                              {item.actorEmail}
                            </p>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span dir="ltr" className="text-lg font-extrabold">
                      {increase ? "+" : ""}{item.delta}
                    </span>
                    <span dir="ltr" className="text-[11px] opacity-70">
                      {item.previousScore} → {item.newScore}
                    </span>
                    <span dir="ltr" className="text-[11px] opacity-70">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                </div>

                {!increase && severity && (
                  <div className="mt-3 flex items-center gap-2 border-t border-current/15 pt-2">
                    <span className="text-xs font-semibold opacity-80">درجة المخالفة:</span>
                    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-bold ${severityBadgeClass(severity)}`}>
                      {SEVERITY_LABELS[severity] ?? item.severityLabel ?? severity}
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
