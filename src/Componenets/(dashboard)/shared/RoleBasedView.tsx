"use client";

import ManagerView from "@/Componenets/(dashboard)/manager/ManagerView";
import StudentView from "@/Componenets/(dashboard)/student/StudentView";
import SupervisorView from "@/Componenets/(dashboard)/supervisor/SupervisorView";
import { useDashboardUser } from "./DashboardShell";

/** Renders exactly the view allowed for the signed-in role. */
export default function RoleBasedView() {
  const user = useDashboardUser();
  if (!user) return null;

  switch (user.role) {
    case "manager":
      return <ManagerView />;
    case "supervisor":
      return <SupervisorView />;
    case "student":
      return <StudentView />;
    default:
      return null;
  }
}
