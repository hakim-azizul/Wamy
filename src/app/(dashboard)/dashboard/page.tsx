import type { Metadata } from "next";
import DashboardOverview from "@/Componenets/(dashboard)/shared/DashboardOverview";

export const metadata: Metadata = {
  title: "لوحة التحكم | السكن الجامعي",
};

export default function DashboardPage() {
  return <DashboardOverview />;
}
