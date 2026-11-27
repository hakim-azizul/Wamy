import type { ScoreStatusStep, ViolationSeverity } from "@/lib/types/scores";

/** Shared score-adjustment reason limit (server enforces the same value). */
export const SCORE_REASON_MAX_LENGTH = 70;

export const VIOLATION_SEVERITY_OPTIONS: { value: ViolationSeverity; label: string }[] = [
  { value: "simple", label: "بسيطة" },
  { value: "moderate", label: "متوسطة" },
  { value: "severe", label: "جسيمة" },
];

export const SEVERITY_LABELS: Record<ViolationSeverity, string> = {
  simple: "بسيطة",
  moderate: "متوسطة",
  severe: "جسيمة",
};

/** Bank-statement style tones shared by every score history view. */
export function transactionTone(delta: number, severity: ViolationSeverity | null): string {
  if (delta > 0) return "border-[#1E4831]/25 bg-[#E8F3ED] text-[#1E4831]";
  if (severity === "simple") return "border-[#D5C9AE] bg-[#FFF6DA] text-[#7A5B10]";
  if (severity === "moderate") return "border-[#E8B875]/50 bg-[#FFE9CC] text-[#9A4E0C]";
  return "border-[#DE2F2C]/25 bg-[#FDE8E7] text-[#931815]";
}

export function severityBadgeClass(severity: ViolationSeverity | null): string {
  if (severity === "simple") return "bg-[#FFF0B8] text-[#7A5B10] border-[#D5B44A]/50";
  if (severity === "moderate") return "bg-[#FFD9A8] text-[#9A4E0C] border-[#E8B875]/60";
  return "bg-[#FDE8E7] text-[#931815] border-[#DE2F2C]/30";
}

/** Dormitory incentive & penalty ladder, ordered from highest to lowest. */
export const SCORE_LADDER: ScoreStatusStep[] = [
  { key: "star", label: "نجم السكن", range: "200+", description: "درع الطالب المثالي" },
  { key: "leader", label: "قائد", range: "150 – 200", description: "لوحة الشرف تعلق في مدخل السكن" },
  { key: "active", label: "نشيط", range: "100 – 150" },
  { key: "beginner", label: "مبتدئ", range: "100" },
  { key: "lazy", label: "كسول", range: "70 – 100" },
  { key: "bad", label: "سيئ", range: "60 – 70" },
  { key: "compensation", label: "تعويض", range: "+50" },
  { key: "grossError", label: "خطأ جسيم", range: "40 – 50" },
  { key: "outside", label: "خارج السكن", range: "< 40" },
];

export type ScoreScaleSide = "negative" | "center" | "positive";

export interface ScoreScaleStation {
  key: string;
  label: string;
  range: string;
  /** Position on the horizontal scale (0 = far negative, 50 = مبتدئ, 100 = far positive). */
  offset: number;
  /** Representative score used for interpolation between stations. */
  anchor: number;
  side: ScoreScaleSide;
}

/**
 * Diverging evaluation scale centered on «مبتدئ» = 100.
 * Penalty stations live to the LEFT of center, achievement stations to the RIGHT.
 * They are never treated as a sequential "completed" checklist.
 */
export const SCORE_SCALE_STATIONS: ScoreScaleStation[] = [
  { key: "outside", label: "خارج السكن", range: "< 40", offset: 0, anchor: 20, side: "negative" },
  { key: "grossError", label: "خطأ جسيم", range: "40 – 50", offset: 10, anchor: 45, side: "negative" },
  { key: "compensation", label: "تعويض", range: "+50", offset: 20, anchor: 55, side: "negative" },
  { key: "bad", label: "سيئ", range: "60 – 70", offset: 30, anchor: 65, side: "negative" },
  { key: "lazy", label: "كسول", range: "70 – 100", offset: 40, anchor: 85, side: "negative" },
  { key: "beginner", label: "مبتدئ", range: "100", offset: 50, anchor: 100, side: "center" },
  { key: "active", label: "نشيط", range: "100 – 150", offset: 66.7, anchor: 125, side: "positive" },
  { key: "leader", label: "قائد", range: "150 – 200", offset: 83.3, anchor: 175, side: "positive" },
  { key: "star", label: "نجم السكن", range: "200+", offset: 100, anchor: 200, side: "positive" },
];

/**
 * Continuous zone colors. One palette for every score and station, so the rail,
 * the station dots and the current pointer always harmonize.
 * Amber → orange → red below 100; neutral sand at 100; soft → medium → deep green above.
 */
const ZONE_STOPS: { score: number; color: string }[] = [
  { score: 20, color: "#DE2F2C" },
  { score: 45, color: "#E8822B" },
  { score: 65, color: "#E0A530" },
  { score: 85, color: "#D8BC45" },
  { score: 100, color: "#C7B99B" },
  { score: 125, color: "#A9C4B2" },
  { score: 150, color: "#7FA98C" },
  { score: 175, color: "#4F7D5F" },
  { score: 200, color: "#1E4831" },
];

function mixHex(from: string, to: string, fraction: number): string {
  const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)));
  const channel = (hex: string, index: number) => parseInt(hex.slice(index, index + 2), 16);
  const part = (index: number) =>
    clamp(channel(from, index) + (channel(to, index) - channel(from, index)) * fraction)
      .toString(16)
      .padStart(2, "0");
  return `#${part(1)}${part(3)}${part(5)}`;
}

export function scoreZoneColor(score: number): string {
  const value = Math.max(20, Math.min(200, score));
  if (value <= ZONE_STOPS[0].score) return ZONE_STOPS[0].color;
  if (value >= ZONE_STOPS[ZONE_STOPS.length - 1].score) return ZONE_STOPS[ZONE_STOPS.length - 1].color;

  for (let index = 0; index < ZONE_STOPS.length - 1; index += 1) {
    const from = ZONE_STOPS[index];
    const to = ZONE_STOPS[index + 1];
    if (value >= from.score && value <= to.score) {
      return mixHex(from.color, to.color, (value - from.score) / (to.score - from.score || 1));
    }
  }
  return ZONE_STOPS[4].color;
}

export function positiveStationColor(anchor: number): string {
  return scoreZoneColor(anchor);
}

export function negativeStationColor(anchor: number): string {
  return scoreZoneColor(anchor);
}

/** Accurate pointer position along the scale, interpolated between stations. */
export function scoreScalePosition(score: number): number {
  const value = Math.max(0, Math.min(200, score));
  const stations = SCORE_SCALE_STATIONS;

  if (value <= stations[0].anchor) return stations[0].offset;
  if (value >= stations[stations.length - 1].anchor) return 100;

  for (let index = 0; index < stations.length - 1; index += 1) {
    const from = stations[index];
    const to = stations[index + 1];
    if (value >= from.anchor && value <= to.anchor) {
      const fraction = (value - from.anchor) / (to.anchor - from.anchor || 1);
      return from.offset + fraction * (to.offset - from.offset);
    }
  }
  return 50;
}

export function currentStatus(score: number): ScoreStatusStep {
  if (score >= 200) return SCORE_LADDER[0];
  if (score >= 150) return SCORE_LADDER[1];
  if (score > 100) return SCORE_LADDER[2];
  if (score === 100) return SCORE_LADDER[3];
  if (score >= 70) return SCORE_LADDER[4];
  if (score >= 60) return SCORE_LADDER[5];
  if (score >= 50) return SCORE_LADDER[6];
  if (score >= 40) return SCORE_LADDER[7];
  return SCORE_LADDER[8];
}

export function pointsToNextMilestone(score: number) {
  const toLeader = Math.max(0, 150 - score);
  const toStar = Math.max(0, 200 - score);
  return { toLeader, toStar };
}

export interface NextPositiveStation {
  key: "beginner" | "leader" | "star";
  label: string;
  target: number;
  remaining: number;
  description: string;
  /** Recovery step below the neutral center, vs an achievement step above it. */
  recovery: boolean;
}

/**
 * The ONE next stoppage to show in the unified card, derived from the live score.
 * Below 100 the next step is recovery to «مبتدئ» (100); from 100 up it walks the
 * positive milestones. null means the top tier (نجم السكن 200+) is achieved.
 */
export function nextPositiveStation(score: number): NextPositiveStation | null {
  if (score >= 200) return null;
  if (score >= 150) {
    return {
      key: "star",
      label: "نجم السكن",
      target: 200,
      remaining: 200 - score,
      description: "200+ – درع الطالب المثالي",
      recovery: false,
    };
  }
  if (score >= 100) {
    return {
      key: "leader",
      label: "قائد",
      target: 150,
      remaining: 150 - score,
      description: "150 – لوحة الشرف تعلق في مدخل السكن",
      recovery: false,
    };
  }
  return {
    key: "beginner",
    label: "مبتدئ",
    target: 100,
    remaining: 100 - score,
    description: "100 — العودة إلى نقطة التوازن",
    recovery: true,
  };
}
