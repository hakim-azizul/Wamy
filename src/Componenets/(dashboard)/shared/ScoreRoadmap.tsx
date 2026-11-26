"use client";

import { Flag, Star, Trophy } from "lucide-react";
import { currentStatus, pointsToNextMilestone, SCORE_LADDER } from "@/lib/scoreSystem";

export default function ScoreRoadmap({ score }: { score: number }) {
  const status = currentStatus(score);
  const { toLeader, toStar } = pointsToNextMilestone(score);

  return (
    <section className="rounded-2xl border border-[#D5C9AE] bg-[#F9F5EC] p-6 shadow-sm">
      <div className="mb-5 flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#DCE6E0] text-[#1E4831]">
          <Flag className="h-5 w-5" />
        </span>
        <div>
          <h2 className="text-lg font-extrabold text-[#1E4831]">خارطة التقدم</h2>
          <p className="text-xs text-[#657F71]">حالتك الحالية: {status.label} ({status.range})</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#1E4831]/20 bg-[#DCE6E0]/60 p-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-4 w-4 text-[#1E4831]" />
            <span className="text-xs font-bold text-[#1E4831]">للوصول إلى «قائد»</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#1E4831]" dir="ltr">
            {toLeader === 0 ? "تم الوصول ✓" : `${toLeader} نقطة`}
          </p>
          <p className="mt-1 text-[11px] text-[#657F71]">150 نقطة — لوحة الشرف تعلق في مدخل السكن</p>
        </div>
        <div className="rounded-2xl border border-[#DE2F2C]/20 bg-[#FDE8E7]/60 p-4">
          <div className="flex items-center gap-2">
            <Star className="h-4 w-4 text-[#DE2F2C]" />
            <span className="text-xs font-bold text-[#931815]">للوصول إلى «نجم السكن»</span>
          </div>
          <p className="mt-2 text-2xl font-extrabold text-[#DE2F2C]" dir="ltr">
            {toStar === 0 ? "تم الوصول ✓" : `${toStar} نقطة`}
          </p>
          <p className="mt-1 text-[11px] text-[#657F71]">200+ نقطة — درع الطالب المثالي</p>
        </div>
      </div>

      <div className="space-y-2">
        {SCORE_LADDER.map((step) => {
          const active = step.key === status.key;
          return (
            <div
              key={step.key}
              className={`flex items-center justify-between gap-4 rounded-xl border px-4 py-2.5 text-sm ${
                active
                  ? "border-[#1E4831] bg-[#1E4831] font-bold text-[#F9F5EC]"
                  : "border-[#D5C9AE] bg-white text-[#3E5E4D]"
              }`}
            >
              <span className="font-bold">{step.label}</span>
              <span dir="ltr" className="text-xs font-semibold opacity-80">{step.range}</span>
            </div>
          );
        })}
      </div>
    </section>
  );
}
