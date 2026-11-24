import type { Metadata } from "next";
import ProfileForm from "@/Componenets/(dashboard)/student/ProfileForm";

export const metadata: Metadata = { title: "بياناتي | لوحة الطالب" };

export default function StudentProfilePage() {
  return <ProfileForm />;
}
