import type { ScoreStatusStep, ViolationSeverity } from "@/lib/types/scores";

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

/** Accurate pointer position along the scale, interpolated between stations. */
/** Green graduation for achievement stations, from soft near center to deep at the edge. */
export function positiveStationColor(anchor: number): string {
  if (anchor <= 125) return "#7FA98C";
  if (anchor <= 175) return "#3E5E4D";
  return "#1E4831";
}

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
