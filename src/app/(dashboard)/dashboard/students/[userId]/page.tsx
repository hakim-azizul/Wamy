import type { Metadata } from "next";
import StudentCvPage from "@/Componenets/(dashboard)/shared/StudentCvPage";

export const metadata: Metadata = { title: "ملف الطالب | السكن الجامعي" };

export default function StudentCvRoute() {
  return <StudentCvPage />;
}
