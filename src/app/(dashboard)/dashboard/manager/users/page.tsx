import { Suspense } from "react";
import type { Metadata } from "next";
import UsersView from "@/Componenets/(dashboard)/manager/UsersView";

export const metadata: Metadata = { title: "كل المستخدمين | لوحة المدير" };

export default function ManagerUsersPage() {
  return (
    <Suspense fallback={<p className="text-sm text-[#657F71]">جارٍ تحميل المستخدمين...</p>}>
      <UsersView />
    </Suspense>
  );
}
