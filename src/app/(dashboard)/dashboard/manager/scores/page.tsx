import type { Metadata } from "next";
import ScoreManagementView from "@/Componenets/(dashboard)/shared/ScoreManagementView";

export const metadata: Metadata = { title: "نظام النقاط | لوحة المدير" };

export default function ManagerScoresPage() {
  return <ScoreManagementView />;
}
