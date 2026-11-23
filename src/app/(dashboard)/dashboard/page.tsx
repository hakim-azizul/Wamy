import type { Metadata } from "next";
import RoleBasedView from "@/Componenets/(dashboard)/shared/RoleBasedView";

export const metadata: Metadata = {
  title: "لوحة التحكم | السكن الجامعي",
};

export default function DashboardPage() {
  return <RoleBasedView />;
}
