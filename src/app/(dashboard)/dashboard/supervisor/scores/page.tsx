import { Suspense } from "react";
import type { Metadata } from "next";
import ScoreManagementView from "@/Componenets/(dashboard)/shared/ScoreManagementView";

export const metadata: Metadata = { title: "نظام النقاط | لوحة المشرف" };

export default function SupervisorScoresPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#657F71]">جارٍ تحميل نظام النقاط...</p>}>
      <ScoreManagementView />
    </Suspense>
  );
}
