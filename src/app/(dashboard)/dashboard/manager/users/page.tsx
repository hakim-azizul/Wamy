import { Suspense } from "react";
import type { Metadata } from "next";
import UsersView from "@/Componenets/(dashboard)/manager/UsersView";
import WamyLoader from "@/Componenets/shared/WamyLoader";

export const metadata: Metadata = { title: "كل المستخدمين | لوحة المدير" };

export default function ManagerUsersPage() {
  return (
    <Suspense fallback={<WamyLoader label="جاري تحميل المستخدمين..." variant="compact" />}>
      <UsersView />
    </Suspense>
  );
}
