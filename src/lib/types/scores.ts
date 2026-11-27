export type ViolationSeverity = "simple" | "moderate" | "severe";

export interface ScoreTransaction {
  _id: string;
  studentUserId: string;
  studentEmail: string;
  // Modifier attribution is present ONLY for manager callers (server-enforced).
  actorUserId?: string | null;
  actorEmail?: string | null;
  actorName?: string | null;
  actorRole?: "manager" | "supervisor" | null;
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
