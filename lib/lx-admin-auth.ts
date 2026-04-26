import { cookies } from "next/headers";
import { LX_ADMIN_SESSION_COOKIE } from "@/lib/lx-admin-session";

export async function hasLxAdminSession() {
  const cookieStore = await cookies();

  return Boolean(cookieStore.get(LX_ADMIN_SESSION_COOKIE)?.value);
}
