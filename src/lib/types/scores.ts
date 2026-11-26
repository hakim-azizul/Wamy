export type ViolationSeverity = "simple" | "moderate" | "severe";

export interface ScoreTransaction {
  _id: string;
  studentUserId: string;
  studentEmail: string;
  actorUserId: string;
  actorEmail: string;
  actorName?: string | null;
  actorRole: "manager" | "supervisor";
  delta: number;
  previousScore: number;
  newScore: number;
  reason: string;
  violationSeverity: ViolationSeverity | null;
  severityLabel: string | null;
  createdAt: Date | string;
}

export interface ScoreStatusStep {
  key: string;
  label: string;
  range: string;
  description?: string;
}
