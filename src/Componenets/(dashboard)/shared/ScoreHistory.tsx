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
    <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-4 shadow-sm sm:p-5">
      <div className="mb-3 flex items-center justify-between gap-3 border-b border-[#D5C9AE] pb-2">
        <h2 className="text-base font-extrabold text-[#1E4831]">سجل النقاط</h2>
        <span className="rounded-full border border-[#1E4831]/20 bg-white px-2.5 py-0.5 text-[11px] font-bold text-[#1E4831]">
          {transactions.length} عملية
        </span>
      </div>

      {transactions.length === 0 ? (
        <p className="py-5 text-center text-xs text-[#657F71]">لا توجد عمليات على الدرجة بعد.</p>
      ) : (
        <div className="space-y-1.5" dir="rtl">
          {transactions.map((item) => {
            const increase = item.delta > 0;
            const severity = item.violationSeverity as ViolationSeverity | null;
            const actor = item.actorName || item.actorEmail;

            return (
              <div
                key={item._id}
                className={`flex flex-nowrap items-center justify-between gap-2 whitespace-nowrap rounded-lg border px-2.5 py-1.5 text-xs shadow-sm sm:gap-3 sm:px-3 ${transactionTone(
                  item.delta,
                  severity,
                )}`}
              >
                {/* One horizontal group: direction, reason, actor (manager), severity, date. */}
                <div className="flex min-w-0 flex-nowrap items-center gap-2">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current/20 bg-white/70">
                    {increase ? (
                      <ArrowUpRight className="h-3 w-3" />
                    ) : (
                      <ArrowDownLeft className="h-3 w-3" />
                    )}
                  </span>

                  <span className="max-w-[9rem] truncate font-bold sm:max-w-xs lg:max-w-md">
                    {item.reason}
                  </span>

                  {showActor && actor && (
                    <span className="hidden max-w-[9rem] truncate text-[11px] opacity-80 lg:inline">
                      {actor}
                    </span>
                  )}

                  {!increase && severity && (
                    <span
                      title="درجة المخالفة"
                      aria-label={`درجة المخالفة: ${SEVERITY_LABELS[severity] ?? item.severityLabel ?? severity}`}
                      className={`shrink-0 rounded-full border px-1.5 py-0 text-[10px] font-extrabold ${severityBadgeClass(
                        severity,
                      )}`}
                    >
                      {SEVERITY_LABELS[severity] ?? item.severityLabel ?? severity}
                    </span>
                  )}

                  <span
                    dir="ltr"
                    className="hidden shrink-0 text-[10px] opacity-70 sm:inline"
                  >
                    {formatDate(item.createdAt)}
                  </span>
                </div>

                {/* Delta + balance transition, grouped on the same line. */}
                <div className="flex shrink-0 flex-nowrap items-center gap-2" dir="ltr">
                  <span className="text-sm font-extrabold">
                    {increase ? "+" : ""}
                    {item.delta}
                  </span>
                  <span className="text-[10px] opacity-70">
                    {item.previousScore} → {item.newScore}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
