"use client";

import { Check, Flag, Star, Trophy } from "lucide-react";
import {
  currentStatus,
  nextPositiveStation,
  negativeStationColor,
  positiveStationColor,
  SCORE_SCALE_STATIONS,
  scoreScalePosition,
  scoreZoneColor,
  type ScoreScaleStation,
} from "@/lib/scoreSystem";

/** Smooth, continuous colors shared by the rail, nodes and pointer. */
const indicatorColor = (score: number): string => scoreZoneColor(score);

const SCALE_RAIL_GRADIENT =
  "linear-gradient(to right, #DE2F2C 0%, #E8822B 18%, #E0A530 34%, #D8BC45 44%, #C7B99B 50%, #A9C4B2 56%, #7FA98C 66%, #4F7D5F 81%, #1E4831 100%)";

/**
 * One unified, RTL, light glass card: current score + status + remaining-point
 * badges + a DIVERGING evaluation scale centered on «مبتدئ» (100). Rendered
 * directly above سجل النقاط. Penalty stations are never shown as "completed".
 */
export default function ScoreMilestoneCard({ score }: { score: number }) {
  const status = currentStatus(score);
  const nextStation = nextPositiveStation(score);
  const offset = scoreScalePosition(score);
  const isPositive = score > 100;
  const isNegative = score < 100;
  // When the pointer sits on a station, let the pointer carry the emphasis and
  // keep the underlying anchor node light instead of stacking two heavy dots.
  const pointerOnStation = SCORE_SCALE_STATIONS.some(
    (station) => Math.abs(station.offset - offset) < 2.5,
  );

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

        {/* Single next stoppage, always derived from the live score. */}
        {nextStation ? (
          <div
            className={`flex min-w-62.5 items-center gap-4 rounded-2xl border p-3.5 shadow-sm backdrop-blur-md ${
              nextStation.recovery
                ? "border-[#D5B44A]/45 bg-[#FFF6DA]/80"
                : "border-[#1E4831]/15 bg-white/75"
            }`}
          >
            <span
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                nextStation.recovery
                  ? "bg-[#FFF0B8] text-[#7A5B10]"
                  : "bg-[#DCE6E0]/80 text-[#1E4831]"
              }`}
            >
              {nextStation.key === "beginner" ? (
                <Flag className="h-5 w-5" />
              ) : nextStation.key === "leader" ? (
                <Trophy className="h-5 w-5" />
              ) : (
                <Star className="h-5 w-5" />
              )}
            </span>
            <div className="min-w-0">
              <p
                className={`text-[11px] font-bold ${
                  nextStation.recovery ? "text-[#7A5B10]" : "text-[#1E4831]"
                }`}
              >
                {nextStation.recovery ? "الخطوة التالية للتعافي: «" : "الخطوة التالية: «"}
                {nextStation.label}»
              </p>
              <p
                className={`mt-1 text-xl font-extrabold ${
                  nextStation.recovery ? "text-[#7A5B10]" : "text-[#1E4831]"
                }`}
                dir="ltr"
              >
                {nextStation.remaining} نقطة
              </p>
              <p className="mt-0.5 text-[10px] text-[#657F71]">{nextStation.description}</p>
            </div>
          </div>
        ) : (
          <div className="flex min-w-62.5 items-center gap-4 rounded-2xl border border-[#1E4831]/25 bg-[#DCE6E0]/75 p-3.5 shadow-sm backdrop-blur-md">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/85 text-[#1E4831]">
              <Star className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <p className="text-[11px] font-extrabold text-[#1E4831]">أعلى مستوى تم الوصول ✓</p>
              <p className="mt-1 text-lg font-extrabold text-[#1E4831]">نجم السكن</p>
              <p className="mt-0.5 text-[10px] text-[#3E5E4D]">200+ — درع الطالب المثالي</p>
            </div>
          </div>
        )}
      </div>

      {/* Diverging scale: penalty stations left of center, achievement stations right. */}
      <div className="relative mt-9" dir="ltr">
        <div className="overflow-x-auto pb-2">
          {/* horizontal padding keeps the first/last station labels unclipped */}
          <div className="relative h-24 min-w-190 px-10">
            <div className="relative h-full">
              {/* one continuous, two-way colorized rail */}
              <div
                className="absolute left-0 right-0 top-6.75 h-2 rounded-full shadow-inner"
                style={{ background: SCALE_RAIL_GRADIENT }}
              />

              {/* center marker — مبتدئ (100) */}
              <div className="absolute left-1/2 top-4.75 h-5 w-0.5 rounded-full bg-white/80 shadow-sm" />

              {/* light, accurate pointer that works both on and between stations */}
              <div
                className="absolute top-6.75 z-20 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-500"
                style={{ left: `${offset}%`, backgroundColor: `${indicatorColor(score)}2E`, filter: "blur(3px)" }}
              />
              <div
                className="absolute top-6.75 z-30 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-sm transition-all duration-500"
                style={{ left: `${offset}%`, backgroundColor: indicatorColor(score) }}
              />
              <div
                className="absolute -top-0.5 z-20 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/70 bg-white/80 px-2 py-0.5 text-[9px] font-bold shadow-sm backdrop-blur-md"
                style={{ left: `${offset}%`, color: indicatorColor(score) }}
                dir="rtl"
              >
                {status.label} · <span dir="ltr">{score}</span>
              </div>

              {/* station dots tinted to their zone color */}
              {SCORE_SCALE_STATIONS.map((station) => {
                const isCurrent = station.key === status.key;
                const stationColor =
                  station.side === "positive"
                    ? positiveStationColor(station.anchor)
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
                    soften={isCurrent && pointerOnStation}
                  />
                );
              })}
            </div>
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
  soften,
}: {
  station: ScoreScaleStation;
  isCurrent: boolean;
  achievedPositive: boolean;
  stationColor: string;
  soften: boolean;
}) {
  const emphasized = isCurrent && !soften;

  return (
    <div
      className="absolute top-4 z-10 flex w-20 -translate-x-1/2 flex-col items-center text-center"
      style={{ left: `${station.offset}%` }}
    >
      <span
        className="flex h-7 w-7 items-center justify-center rounded-full border-2 text-[10px] font-extrabold shadow-sm transition-all"
        style={{
          backgroundColor: emphasized
            ? stationColor
            : achievedPositive
              ? `${stationColor}3D`
              : `${stationColor}1F`,
          color: emphasized ? "#FFFFFF" : stationColor,
          borderColor: emphasized ? "#FFFFFF" : `${stationColor}A6`,
          transform: emphasized ? "scale(1.12)" : undefined,
          boxShadow: emphasized ? `0 0 0 3px ${stationColor}26` : undefined,
        }}
      >
        {emphasized ? "●" : achievedPositive ? <Check className="h-3.5 w-3.5" /> : ""}
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
