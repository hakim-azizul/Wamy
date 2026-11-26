import type { Metadata } from "next";
import ScoreManagementView from "@/Componenets/(dashboard)/shared/ScoreManagementView";

export const metadata: Metadata = { title: "نظام النقاط | لوحة المشرف" };

export default function SupervisorScoresPage() {
  return <ScoreManagementView />;
}
