import { cookies } from "next/headers";
import {
  LX_ADMIN_SESSION_COOKIE,
  verifyLxAdminSessionToken,
} from "@/lib/lx-admin-session";

export async function hasLxAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(LX_ADMIN_SESSION_COOKIE)?.value;

  return Boolean(token && verifyLxAdminSessionToken(token));
}
