import { redirect } from "next/navigation";
import { hasLxAdminSession } from "@/lib/lx-admin-auth";
import { BlockEditorShell } from "@/components/lx-admin/block-editor-shell";

export default async function BlockEditorPage({
  searchParams,
}: {
  searchParams: Promise<{ slug?: string }>;
}) {
  if (!(await hasLxAdminSession())) {
    redirect("/lx-admin/login");
  }

  const params = await searchParams;
  const blockSlug = typeof params.slug === "string" ? params.slug.trim() : "";

  if (!blockSlug) {
    redirect("/lx-admin");
  }

  return <BlockEditorShell blockSlug={blockSlug} />;
}
