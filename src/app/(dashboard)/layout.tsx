import DashboardShell from "@/Componenets/(dashboard)/shared/DashboardShell";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell>{children}</DashboardShell>;
}
