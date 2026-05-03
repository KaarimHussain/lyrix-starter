import { NextResponse } from "next/server";
import { hasLxAdminSession } from "@/lib/lx-admin-auth";
import { isLyrixPageDocument } from "@/lib/lyrix-document";
import { LyrixPageService } from "@/lib/lyrix-page-service";

function readPathFromUrl(request: Request) {
  const url = new URL(request.url);

  return url.searchParams.get("path") ?? "/";
}

export async function GET(request: Request) {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to edit pages." },
      { status: 401 }
    );
  }

  try {
    const pageService = new LyrixPageService();
    const document = await pageService.getPageDocument(readPathFromUrl(request));

    return NextResponse.json({ document });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load page document.";
    const status = message.includes("does not exist") ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to save pages." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const routePath = typeof body?.path === "string" ? body.path : "/";
    const document = body?.document;

    if (!isLyrixPageDocument(document)) {
      return NextResponse.json(
        { error: "Invalid Lyrix page document." },
        { status: 400 }
      );
    }

    const pageService = new LyrixPageService();
    const savedDocument = await pageService.savePageDocument(
      routePath,
      document
    );

    return NextResponse.json({ document: savedDocument });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save page document.";
    const status = message.includes("does not exist") ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
