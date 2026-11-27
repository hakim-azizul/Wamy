"use client";

import { Check, Flag, Star, Trophy } from "lucide-react";
import {
  currentStatus,
  pointsToNextMilestone,
  SCORE_SCALE_STATIONS,
  scoreScalePosition,
  type ScoreScaleStation,
} from "@/lib/scoreSystem";

/** Tone for a negative-station node: amber near 100 → orange → red as score falls. */
function negativeStationColor(anchor: number): string {
  if (anchor <= 40) return "#DE2F2C";
  if (anchor <= 55) return "#E8822B";
  if (anchor <= 65) return "#E0A530";
  return "#D8BC45";
}

function indicatorColor(score: number): string {
  if (score > 100) return "#1E4831";
  if (score === 100) return "#3E5E4D";
  return negativeStationColor(score);
}

/**
 * One unified, RTL, light glass card: current score + status + remaining-point
 * badges + a DIVERGING evaluation scale centered on «مبتدئ» (100). Rendered
 * directly above سجل النقاط. Penalty stations are never shown as "completed".
 */
export default function ScoreMilestoneCard({ score }: { score: number }) {
  const status = currentStatus(score);
  const { toLeader, toStar } = pointsToNextMilestone(score);
  const offset = scoreScalePosition(score);
  const isPositive = score > 100;
  const isNegative = score < 100;

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
              <span
                className="rounded-full border px-3 py-1 text-sm font-extrabold shadow-sm"
                style={{
                  borderColor: `${indicatorColor(score)}55`,
                  backgroundColor: `${indicatorColor(score)}1A`,
                  color: indicatorColor(score),
                }}
              >
                {status.label}
              </span>
            </div>
            <p className="mt-2 text-[11px] font-medium text-[#657F71]">
              النطاق الحالي: <span dir="ltr" className="font-bold">{status.range}</span>
              {" · "}
              {isPositive ? "الجانب الإيجابي" : isNegative ? "الجانب التحذيري" : "نقطة التوازن"}
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

      {/* Diverging scale: penalty stations left of center, achievement stations right. */}
      <div className="relative mt-9" dir="ltr">
        <div className="overflow-x-auto pb-2">
          <div className="relative h-24 min-w-[720px]">
            {/* neutral rail */}
            <div className="absolute left-0 right-0 top-[27px] h-1.5 rounded-full bg-[#D5C9AE]/50" />

            {/* negative-side fill: amber → orange → red as it extends left from center */}
            {isNegative && (
              <div
                className="absolute top-[27px] h-1.5 rounded-full transition-all duration-500"
                style={{
                  left: `${offset}%`,
                  width: `${50 - offset}%`,
                  background: "linear-gradient(to right, #D8BC45, #E0A530, #E8822B, #DE2F2C)",
                }}
              />
            )}

            {/* positive-side fill: green, extending right from center */}
            {isPositive && (
              <div
                className="absolute top-[27px] h-1.5 rounded-full bg-gradient-to-r from-[#3E5E4D] to-[#1E4831] transition-all duration-500"
                style={{ left: "50%", width: `${offset - 50}%` }}
              />
            )}

            {/* center marker — مبتدئ (100) */}
            <div className="absolute left-1/2 top-[19px] h-5 w-px bg-[#1E4831]/35" />

            {/* accurate pointer between stations */}
            <div
              className="absolute top-[22px] z-20 h-4 w-4 -translate-x-1/2 rounded-full border-2 border-white shadow-md transition-all duration-500"
              style={{ left: `${offset}%`, backgroundColor: indicatorColor(score) }}
            />
            <div
              className="absolute top-0 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/80 bg-white/90 px-2 py-0.5 text-[10px] font-extrabold shadow-sm backdrop-blur-md"
              style={{ left: `${offset}%`, color: indicatorColor(score) }}
              dir="rtl"
            >
              {status.label} · <span dir="ltr">{score}</span>
            </div>

            {/* stations */}
            {SCORE_SCALE_STATIONS.map((station) => {
              const isCurrent = station.key === status.key;
              const stationColor =
                station.side === "positive"
                  ? "#1E4831"
                  : station.side === "center"
                    ? "#3E5E4D"
                    : negativeStationColor(station.anchor);
              const achievedPositive = station.side === "positive" && score >= station.anchor;

              return (
                <StationNode
                  key={station.key}
                  station={station}
                  isCurrent={isCurrent}
                  achievedPositive={achievedPositive}
                  stationColor={stationColor}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function StationNode({
  station,
  isCurrent,
  achievedPositive,
  stationColor,
}: {
  station: ScoreScaleStation;
  isCurrent: boolean;
  achievedPositive: boolean;
  stationColor: string;
}) {
  return (
    <div
      className="absolute top-4 z-10 flex w-20 -translate-x-1/2 flex-col items-center text-center"
      style={{ left: `${station.offset}%` }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white/80 text-[10px] font-extrabold shadow-sm transition-all"
        style={{
          backgroundColor: isCurrent ? stationColor : achievedPositive ? "#DCE6E0" : "#FFFFFF",
          color: isCurrent ? "#FFFFFF" : achievedPositive ? "#1E4831" : "#7A8B81",
          borderColor: isCurrent ? "#FFFFFF" : achievedPositive ? "#1E4831" : "#D5C9AE",
          transform: isCurrent ? "scale(1.18)" : undefined,
          boxShadow: isCurrent ? `0 0 0 4px ${stationColor}22` : undefined,
        }}
      >
        {isCurrent ? "●" : achievedPositive ? <Check className="h-3.5 w-3.5" /> : ""}
      </span>
      <span
        dir="rtl"
        className={`mt-2 text-[10px] font-bold leading-tight ${isCurrent ? "text-[#1E4831]" : "text-[#657F71]"}`}
      >
        {station.label}
      </span>
      <span dir="ltr" className="mt-0.5 text-[9px] font-semibold text-[#8A9A91]">
        {station.range}
      </span>
    </div>
  );
}
