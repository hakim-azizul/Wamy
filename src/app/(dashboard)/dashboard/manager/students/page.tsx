import type { Metadata } from "next";
import ManagerStudentsView from "@/Componenets/(dashboard)/manager/StudentsView";

export const metadata: Metadata = { title: "الطلاب | لوحة المدير" };

export default function ManagerStudentsPage() {
  return <ManagerStudentsView />;
}
