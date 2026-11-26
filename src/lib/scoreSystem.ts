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

export function currentStatus(score: number): ScoreStatusStep {
  if (score >= 200) return SCORE_LADDER[0];
  if (score >= 150) return SCORE_LADDER[1];
  if (score > 100) return SCORE_LADDER[2];
  if (score === 100) return SCORE_LADDER[3];
  if (score >= 70) return SCORE_LADDER[4];
  if (score >= 60) return SCORE_LADDER[5];
  return SCORE_LADDER[8];
}

export function pointsToNextMilestone(score: number) {
  const toLeader = Math.max(0, 150 - score);
  const toStar = Math.max(0, 200 - score);
  return { toLeader, toStar };
}
