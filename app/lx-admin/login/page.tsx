import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LxAdminLoginForm } from "@/components/lx-admin/login-form";
import { hasLxAdminSession } from "@/lib/lx-admin-auth";

export default async function LxAdminLoginPage() {
  if (await hasLxAdminSession()) {
    redirect("/lx-admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 px-5 py-10">
      <Card className="w-full max-w-sm rounded-lg">
        <CardHeader>
          <CardTitle>Lyrix Admin</CardTitle>
          <CardDescription>
            Sign in with your Lyrix project credentials.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LxAdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
