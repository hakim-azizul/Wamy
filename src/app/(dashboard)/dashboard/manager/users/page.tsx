import type { Metadata } from "next";
import UsersView from "@/Componenets/(dashboard)/manager/UsersView";

export const metadata: Metadata = { title: "كل المستخدمين | لوحة المدير" };

export default function ManagerUsersPage() {
  return <UsersView />;
}
