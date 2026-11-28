import { Suspense } from "react";
import type { Metadata } from "next";
import ScoreManagementView from "@/Componenets/(dashboard)/shared/ScoreManagementView";
import WamyLoader from "@/Componenets/shared/WamyLoader";

export const metadata: Metadata = { title: "نظام النقاط | لوحة المدير" };

export default function ManagerScoresPage() {
  return (
    <Suspense fallback={<WamyLoader label="جاري تحميل نظام النقاط..." variant="compact" />}>
      <ScoreManagementView />
    </Suspense>
  );
}
