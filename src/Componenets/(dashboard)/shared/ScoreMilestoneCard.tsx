"use client";

import { Check, Flag, Star, Trophy } from "lucide-react";
import {
  currentStatus,
  MILESTONE_TRACK,
  pointsToNextMilestone,
} from "@/lib/scoreSystem";

/**
 * One unified, RTL, light glass card: current score + status + remaining-point
 * badges + a horizontal milestone strip. Rendered directly above سجل النقاط.
 */
export default function ScoreMilestoneCard({ score }: { score: number }) {
  const status = currentStatus(score);
  const { toLeader, toStar } = pointsToNextMilestone(score);
  const progress = Math.max(0, Math.min(100, (score / 200) * 100));

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/70 bg-white/70 p-6 shadow-[0_8px_30px_rgba(30,72,49,0.08)] backdrop-blur-xl">
      <div className="pointer-events-none absolute -top-20 -right-16 h-52 w-52 rounded-full bg-[#DCE6E0]/50 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full bg-[#FDE8E7]/40 blur-3xl" />

      <div className="relative flex flex-wrap items-start justify-between gap-5">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/80 bg-white/80 text-[#1E4831] shadow-sm backdrop-blur-md">
            <Flag className="h-6 w-6" />
          </span>
          <div>
            <p className="text-xs font-bold text-[#657F71]">رصيد النقاط الحالي</p>
            <div className="mt-1 flex flex-wrap items-center gap-3">
              <span className="text-5xl font-extrabold leading-none text-[#1E4831]" dir="ltr">
                {score}
              </span>
              <span className="rounded-full border border-[#1E4831]/20 bg-[#DCE6E0]/80 px-3 py-1 text-sm font-extrabold text-[#1E4831] shadow-sm">
                {status.label}
              </span>
            </div>
            <p className="mt-2 text-[11px] font-medium text-[#657F71]">
              النطاق الحالي: <span dir="ltr" className="font-bold">{status.range}</span>
            </p>
          </div>
        </div>

        <div className="grid w-full gap-3 sm:w-auto sm:grid-cols-2">
          <div className="rounded-2xl border border-[#1E4831]/15 bg-white/75 p-3.5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-[#1E4831]" />
              <span className="text-[11px] font-bold text-[#1E4831]">إلى «قائد»</span>
            </div>
            <p className="mt-1.5 text-xl font-extrabold text-[#1E4831]" dir="ltr">
              {toLeader === 0 ? "✓ تم الوصول" : `${toLeader} نقطة`}
            </p>
            <p className="mt-0.5 text-[10px] text-[#657F71]">150 — لوحة الشرف تعلق في مدخل السكن</p>
          </div>

          <div className="rounded-2xl border border-[#DE2F2C]/15 bg-white/75 p-3.5 shadow-sm backdrop-blur-md">
            <div className="flex items-center gap-2">
              <Star className="h-4 w-4 text-[#DE2F2C]" />
              <span className="text-[11px] font-bold text-[#931815]">إلى «نجم السكن»</span>
            </div>
            <p className="mt-1.5 text-xl font-extrabold text-[#DE2F2C]" dir="ltr">
              {toStar === 0 ? "✓ تم الوصول" : `${toStar} نقطة`}
            </p>
            <p className="mt-0.5 text-[10px] text-[#657F71]">200+ — درع الطالب المثالي</p>
          </div>
        </div>
      </div>

      {/* Horizontal milestone strip (scrolls on narrow screens, never stacked vertically). */}
      <div className="relative mt-7">
        <div className="overflow-x-auto pb-2">
          <div className="relative min-w-[680px]">
            <div className="absolute inset-x-0 top-3 h-1 rounded-full bg-[#D5C9AE]/60" />
            <div
              className="absolute right-0 top-3 h-1 rounded-full bg-gradient-to-l from-[#1E4831] to-[#3E5E4D] transition-all duration-500"
              style={{ width: `${progress}%` }}
            />

            <ol className="relative flex items-start justify-between">
              {MILESTONE_TRACK.map((step) => {
                const reached = score >= step.threshold;
                const isCurrent = step.key === status.key;

                return (
                  <li
                    key={step.key}
                    className="flex min-w-0 flex-1 flex-col items-center px-1 text-center"
                  >
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[10px] font-extrabold transition-all ${
                        isCurrent
                          ? "scale-110 border-[#1E4831] bg-[#1E4831] text-white ring-4 ring-[#1E4831]/15"
                          : reached
                            ? "border-[#1E4831]/25 bg-[#DCE6E0] text-[#1E4831]"
                            : "border-[#D5C9AE] bg-white/90 text-[#657F71]"
                      }`}
                    >
                      {reached && !isCurrent ? <Check className="h-3.5 w-3.5" /> : isCurrent ? "●" : ""}
                    </span>
                    <span
                      className={`mt-2 text-[10px] font-bold leading-tight ${
                        isCurrent ? "text-[#1E4831]" : reached ? "text-[#3E5E4D]" : "text-[#657F71]"
                      }`}
                    >
                      {step.label}
                    </span>
                    <span dir="ltr" className="mt-0.5 text-[9px] font-semibold text-[#657F71]">
                      {step.range}
                    </span>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </div>
    </section>
  );
}
