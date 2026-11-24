import type { Metadata } from "next";
import CreateStudentForm from "@/Componenets/(dashboard)/supervisor/CreateStudentForm";

export const metadata: Metadata = { title: "إضافة طالب | لوحة المشرف" };

export default function NewStudentPage() {
  return <CreateStudentForm />;
}
