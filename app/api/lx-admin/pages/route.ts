import { NextResponse } from "next/server";
import { hasLxAdminSession } from "@/lib/lx-admin-auth";
import { LyrixPageService } from "@/lib/lyrix-page-service";

export async function GET() {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to view pages." },
      { status: 401 }
    );
  }

  try {
    const pageService = new LyrixPageService();
    const pages = await pageService.listPages();

    return NextResponse.json({ pages });
  } catch {
    return NextResponse.json(
      { error: "Unable to load pages." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to create pages." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name : "";
    const slug = typeof body?.slug === "string" ? body.slug : undefined;
    const pageService = new LyrixPageService();
    const page = await pageService.createPage({ name, slug });

    return NextResponse.json({ page }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create page.";
    const status = message.includes("already exists") ? 409 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to delete pages." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const slug = typeof body?.slug === "string" ? body.slug : "";
    const pageService = new LyrixPageService();
    const page = await pageService.deletePage(slug);

    return NextResponse.json({ page });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete page.";
    const status = message.includes("does not exist") ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
