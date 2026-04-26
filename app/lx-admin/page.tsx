import { redirect } from "next/navigation";
import { LxAdminDashboard } from "@/components/lx-admin/admin-dashboard";
import { hasLxAdminSession } from "@/lib/lx-admin-auth";

export default async function LxAdminPage() {
  if (!(await hasLxAdminSession())) {
    redirect("/lx-admin/login");
  }

  return <LxAdminDashboard />;
}
