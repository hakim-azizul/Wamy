import { Suspense } from "react";
import type { Metadata } from "next";
import ProfileForm from "@/Componenets/(dashboard)/student/ProfileForm";

export const metadata: Metadata = { title: "بياناتي | لوحة الطالب" };

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#657F71]">جارٍ تحميل بياناتك...</p>}>
      <ProfileForm />
    </Suspense>
  );
}
