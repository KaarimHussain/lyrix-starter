import { NextResponse } from "next/server";
import { hasLxAdminSession } from "@/lib/lx-admin-auth";
import { isLyrixBlockDocument } from "@/lib/lyrix-document";
import { LyrixComponentService } from "@/lib/lyrix-component-service";

function readSlugFromUrl(request: Request) {
  const url = new URL(request.url);
  return url.searchParams.get("slug") ?? "";
}

export async function GET(request: Request) {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to edit blocks." },
      { status: 401 }
    );
  }

  try {
    const service = new LyrixComponentService();
    const document = await service.getBlockDocument(readSlugFromUrl(request));

    return NextResponse.json({ document });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to load block document.";
    const status = message.includes("does not exist") ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function PUT(request: Request) {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to save blocks." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const slug = typeof body?.slug === "string" ? body.slug : "";
    const document = body?.document;

    if (!isLyrixBlockDocument(document)) {
      return NextResponse.json(
        { error: "Invalid Lyrix block document." },
        { status: 400 }
      );
    }

    const service = new LyrixComponentService();
    const savedDocument = await service.saveBlockDocument(slug, document);

    return NextResponse.json({ document: savedDocument });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to save block document.";
    const status = message.includes("does not exist") ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
