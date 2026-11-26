import type { Metadata } from "next";
import StudentScoreView from "@/Componenets/(dashboard)/student/StudentScoreView";

export const metadata: Metadata = { title: "نظام النقاط | لوحة الطالب" };

export default function StudentScoresPage() {
  return <StudentScoreView />;
}
