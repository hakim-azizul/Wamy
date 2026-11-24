import type { Metadata } from "next";
import SupervisorStudentsView from "@/Componenets/(dashboard)/supervisor/StudentsView";

export const metadata: Metadata = { title: "الطلاب | لوحة المشرف" };

export default function SupervisorStudentsPage() {
  return <SupervisorStudentsView />;
}
