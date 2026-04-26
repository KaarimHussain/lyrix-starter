import { NextResponse } from "next/server";
import {
  createLxAdminSessionToken,
  LX_ADMIN_SESSION_COOKIE,
  LX_ADMIN_SESSION_MAX_AGE,
} from "@/lib/lx-admin-session";
import { LYRIX_SERVER_URL } from "@/static/data";

function getLyrixWebUrl() {
  return LYRIX_SERVER_URL.replace(/\/$/, "");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const lxProjectId =
      typeof body?.lxProjectId === "string"
        ? body.lxProjectId.trim().toLowerCase()
        : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!/^lx-prj-[a-z0-9]{7}$/.test(lxProjectId) || !password) {
      return NextResponse.json(
        { error: "Enter a valid Lyrix project ID and password." },
        { status: 400 }
      );
    }

    const lyrixWebUrl = getLyrixWebUrl();
    const response = await fetch(`${lyrixWebUrl}/api/lx-admin/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lxProjectId, password }),
      cache: "no-store",
    });

    const payload = await response.json().catch(() => ({}));

    if (!response.ok) {
      return NextResponse.json(
        {
          error:
            payload.error ||
            "Could not verify these Lyrix Admin credentials.",
        },
        { status: response.status }
      );
    }

    const project =
      payload.project &&
        typeof payload.project === "object" &&
        typeof payload.project.id === "string" &&
        payload.project.lxProjectId === lxProjectId
        ? payload.project
        : null;

    if (!project) {
      return NextResponse.json(
        { error: "Lyrix web returned an invalid admin session response." },
        { status: 502 }
      );
    }

    const sessionToken = createLxAdminSessionToken({
      lxProjectId: project.lxProjectId,
      projectId: project.id,
    });

    const result = NextResponse.json(
      {
        project,
      },
      { status: 200 }
    );

    result.cookies.set({
      name: LX_ADMIN_SESSION_COOKIE,
      value: sessionToken,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: LX_ADMIN_SESSION_MAX_AGE,
    });

    return result;
  } catch (error) {
    console.error("POST /api/lx-admin/login failed:", error);
    if (
      error instanceof Error &&
      error.message.includes("LX_ADMIN_SESSION_SECRET")
    ) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        error:
          "Unable to reach the Lyrix web server. Check LYRIX_WEB_URL and try again.",
      },
      { status: 502 }
    );
  }
}
