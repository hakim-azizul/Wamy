import { Suspense } from "react";
import type { Metadata } from "next";
import ProfileForm from "@/Componenets/(dashboard)/student/ProfileForm";
import WamyLoader from "@/Componenets/shared/WamyLoader";

export const metadata: Metadata = { title: "بياناتي | لوحة الطالب" };

export default function StudentProfilePage() {
  return (
    <Suspense fallback={<WamyLoader label="جاري تحميل بياناتك..." variant="compact" />}>
      <ProfileForm />
    </Suspense>
  );
}
