import { redirect } from "next/navigation";
import { Boxes, LockKeyhole, PanelLeft, Sparkles } from "lucide-react";
import { LxAdminLoginForm } from "@/components/lx-admin/login-form";
import { hasLxAdminSession } from "@/lib/lx-admin-auth";

export default async function LxAdminLoginPage() {
  if (await hasLxAdminSession()) {
    redirect("/lx-admin");
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="grid min-h-screen lg:grid-cols-[minmax(0,1fr)_460px]">
        <section className="relative hidden overflow-hidden border-r border-border bg-muted/40 lg:block">
          <div className="absolute inset-0 bg-dot-grid opacity-70" />
          <div className="radial-glow absolute inset-0" />
          <div className="relative flex h-full flex-col justify-between p-10 xl:p-12">
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <PanelLeft className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold">Lyrix Admin</p>
                <p className="text-xs text-muted-foreground">Starter workspace</p>
              </div>
            </div>

            <div className="max-w-xl">
              <p className="mb-4 inline-flex items-center gap-2 rounded-md border border-border bg-background/80 px-3 py-1.5 text-xs font-mono uppercase tracking-wider text-muted-foreground">
                <Sparkles className="size-3.5 text-primary" />
                Project control
              </p>
              <h1 className="text-5xl font-semibold tracking-normal">
                Sign in to shape your Lyrix site.
              </h1>
              <p className="mt-5 max-w-lg text-base leading-7 text-muted-foreground">
                Manage pages, blocks, AI drafts, and publishing settings from the
                local starter dashboard.
              </p>
            </div>

            <div className="grid max-w-xl grid-cols-2 gap-3">
              <div className="rounded-lg border border-border bg-background/80 p-4">
                <Boxes className="mb-3 size-4 text-primary" />
                <p className="text-sm font-medium">Builder-ready</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Keep pages and reusable blocks close to the starter.
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background/80 p-4">
                <LockKeyhole className="mb-3 size-4 text-primary" />
                <p className="text-sm font-medium">Session protected</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Uses verified Lyrix project credentials before opening admin.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-7">
          <div className="w-full max-w-sm">
            <div className="mb-8 lg:hidden">
              <div className="mb-5 flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
                <PanelLeft className="size-5" />
              </div>
              <h1 className="text-3xl font-semibold tracking-normal">
                Lyrix Admin
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Sign in with your Lyrix project credentials.
              </p>
            </div>

            <div className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <div className="mb-6">
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                  Secure access
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-normal">
                  Welcome back
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">
                  Use the project ID and admin password from Lyrix Web.
                </p>
              </div>

              <LxAdminLoginForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
