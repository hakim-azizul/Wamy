import type { Metadata } from "next";
import StudentOverview from "@/Componenets/(dashboard)/student/StudentOverview";

export const metadata: Metadata = { title: "ملفي ودرجتي | لوحة الطالب" };

export default function StudentOverviewPage() {
  return <StudentOverview />;
}
