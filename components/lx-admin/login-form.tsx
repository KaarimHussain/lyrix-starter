"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import LyrixInput from "@/components/LyrixInput";
import { Button } from "@/components/ui/button";

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
    <form className="grid gap-5" onSubmit={handleSubmit}>
      <LyrixInput
        autoComplete="username"
        id="project-id"
        inputSize="lg"
        label="Lyrix Project ID"
        name="projectId"
        placeholder="lx-prj-xxxxxxx"
        type="text"
      />

      <LyrixInput
        autoComplete="current-password"
        error={error}
        id="password"
        inputSize="lg"
        label="Admin Password"
        name="password"
        placeholder="Enter admin password"
        variant="password"
      />

      <Button className="h-12 w-full" disabled={isSubmitting} size="lg" type="submit">
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  );
}
