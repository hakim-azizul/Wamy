import type { Metadata } from "next";
import SupervisorsView from "@/Componenets/(dashboard)/manager/SupervisorsView";

export const metadata: Metadata = { title: "المشرفون | لوحة المدير" };

export default function ManagerSupervisorsPage() {
  return <SupervisorsView />;
}
