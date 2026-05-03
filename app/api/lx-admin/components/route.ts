import { NextResponse } from "next/server";
import { hasLxAdminSession } from "@/lib/lx-admin-auth";
import { LyrixComponentService } from "@/lib/lyrix-component-service";

export async function GET() {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to view components." },
      { status: 401 }
    );
  }

  try {
    const componentService = new LyrixComponentService();
    const components = await componentService.listComponents();

    return NextResponse.json({ components });
  } catch {
    return NextResponse.json(
      { error: "Unable to load components." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to create components." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json();
    const name = typeof body?.name === "string" ? body.name : "";
    const slug = typeof body?.slug === "string" ? body.slug : undefined;
    const componentService = new LyrixComponentService();
    const component = await componentService.createComponent({ name, slug });

    return NextResponse.json({ component }, { status: 201 });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to create component.";
    const status = message.includes("already exists") ? 409 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(request: Request) {
  if (!(await hasLxAdminSession())) {
    return NextResponse.json(
      { error: "You must be signed in to delete components." },
      { status: 401 }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const slug = typeof body?.slug === "string" ? body.slug : "";
    const componentService = new LyrixComponentService();
    const component = await componentService.deleteComponent(slug);

    return NextResponse.json({ component });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unable to delete component.";
    const status = message.includes("does not exist") ? 404 : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
