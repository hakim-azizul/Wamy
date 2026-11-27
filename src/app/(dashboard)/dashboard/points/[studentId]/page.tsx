import type { Metadata } from "next";
import StudentPointsDetailView from "@/Componenets/(dashboard)/shared/StudentPointsDetailView";

export const metadata: Metadata = { title: "نقاط الطالب | السكن الجامعي" };

export default function StudentPointsDetailPage() {
  return <StudentPointsDetailView />;
}
