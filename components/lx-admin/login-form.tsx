"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function LxAdminLoginForm() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const projectId = String(formData.get("projectId") ?? "").trim();
    const password = String(formData.get("password") ?? "").trim();

    if (!projectId || !password) {
      setError("Enter your Lyrix project ID and password.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/lx-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lxProjectId: projectId, password }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(payload.error || "Could not sign in with those credentials.");
        return;
      }

      router.push("/lx-admin");
      router.refresh();
    } catch {
      setError("Could not reach the Lyrix login service. Try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="project-id">
          Lyrix Project ID
        </label>
        <Input
          autoComplete="username"
          id="project-id"
          name="projectId"
          placeholder="lx-prj-xxxxxxx"
          type="text"
        />
      </div>

      <div className="grid gap-2">
        <label className="text-sm font-medium" htmlFor="password">
          Password
        </label>
        <Input
          autoComplete="current-password"
          id="password"
          name="password"
          placeholder="Password"
          type="password"
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button className="w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
