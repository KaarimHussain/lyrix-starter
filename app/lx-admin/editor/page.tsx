import { redirect } from "next/navigation";
import { VisualEditorShell } from "@/components/lx-admin/visual-editor-shell";
import { hasLxAdminSession } from "@/lib/lx-admin-auth";

type LxAdminEditorPageProps = {
  searchParams: Promise<{
    path?: string;
  }>;
};

export default async function LxAdminEditorPage({
  searchParams,
}: LxAdminEditorPageProps) {
  if (!(await hasLxAdminSession())) {
    redirect("/lx-admin/login");
  }

  const params = await searchParams;
  const pagePath = params.path?.startsWith("/") ? params.path : "/";

  return <VisualEditorShell pagePath={pagePath} />;
}
