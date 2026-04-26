"use client";

import { useState } from "react";
import {
  Bot,
  Boxes,
  FileText,
  Globe2,
  LayoutTemplate,
  MessageSquareText,
  MonitorSmartphone,
  PanelLeft,
  Save,
  Settings,
  Sparkles,
  WandSparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type AdminTab = "ai" | "builder" | "site";

const adminTabs: Array<{
  key: AdminTab;
  label: string;
  description: string;
  icon: React.ElementType;
}> = [
  {
    key: "ai",
    label: "AI",
    description: "Generate copy, sections, and quick edits.",
    icon: Sparkles,
  },
  {
    key: "builder",
    label: "Builder",
    description: "Compose pages from Lyrix blocks.",
    icon: LayoutTemplate,
  },
  {
    key: "site",
    label: "Site",
    description: "Manage project settings and publishing.",
    icon: Settings,
  },
];

export function LxAdminDashboard() {
  const [activeTab, setActiveTab] = useState<AdminTab>("builder");

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b bg-card">
        <div className="flex h-14 items-center justify-between gap-4 px-5 lg:px-6">
          <div className="flex items-center gap-3">
            <div className="flex size-8 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
              <PanelLeft className="size-4" />
            </div>
            <div>
              <p className="text-sm font-semibold">Lyrix Admin</p>
              <p className="text-xs text-muted-foreground">Starter control room</p>
            </div>
          </div>
          <Button size="sm" variant="outline">
            View site
          </Button>
        </div>
      </header>

      <div className="grid min-h-[calc(100vh-3.5rem)] lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="border-b border-border bg-sidebar p-3 lg:border-b-0 lg:border-r">
          <div className="px-2 py-3">
            <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
              Workspace
            </p>
            <h1 className="mt-1 text-base font-semibold">Editor Dashboard</h1>
          </div>

          <nav className="grid gap-1" aria-label="Lyrix admin sections">
            {adminTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`flex h-10 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <tab.icon className="size-4 shrink-0" />
                {tab.label}
              </button>
            ))}
          </nav>
        </aside>

        <section className="min-w-0 px-5 py-6 sm:px-7 lg:px-10 lg:py-8">
          {activeTab === "ai" ? <AiPanel /> : null}
          {activeTab === "builder" ? <BuilderPanel /> : null}
          {activeTab === "site" ? <SitePanel /> : null}
        </section>
      </div>
    </main>
  );
}

function AiPanel() {
  return (
    <div className="grid gap-7">
      <PanelHeader
        icon={Bot}
        title="AI"
        description="Draft, rewrite, and structure content before it becomes real page data."
      />

      <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="flex items-center gap-2">
            <MessageSquareText className="size-4 text-muted-foreground" />
            <h2 className="text-sm font-semibold">Prompt Workspace</h2>
          </div>
          <textarea
            className="mt-5 min-h-64 w-full resize-none rounded-lg border border-border bg-background p-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            placeholder="Ask Lyrix AI to draft a hero section, rewrite this page, or generate block ideas..."
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm">
              <WandSparkles className="size-4" />
              Generate
            </Button>
            <Button size="sm" variant="outline">
              Improve copy
            </Button>
            <Button size="sm" variant="outline">
              Suggest blocks
            </Button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">AI Queue</h2>
          <div className="mt-4 grid gap-3 text-sm">
            <AiQueueItem title="Hero copy" status="Ready" />
            <AiQueueItem title="Feature grid ideas" status="Draft" />
            <AiQueueItem title="SEO summary" status="Waiting" />
          </div>
        </div>
      </section>
    </div>
  );
}

function BuilderPanel() {
  return (
    <div className="grid gap-7">
      <PanelHeader
        icon={LayoutTemplate}
        title="Builder"
        description="Arrange pages visually while keeping every block backed by real React components."
      />

      <section className="grid gap-5 xl:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Pages</h2>
            <Button size="sm" variant="outline">
              New
            </Button>
          </div>
          <div className="mt-4 grid gap-2">
            <PageRow active title="Home" path="/" />
            <PageRow title="About" path="/about" />
            <PageRow title="Contact" path="/contact" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
            <div>
              <h2 className="text-sm font-semibold">Home</h2>
              <p className="text-xs text-muted-foreground">3 blocks in draft</p>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">
                <MonitorSmartphone className="size-4" />
                Preview
              </Button>
              <Button size="sm">
                <Save className="size-4" />
                Save
              </Button>
            </div>
          </div>

          <div className="grid gap-4 p-5">
            <BlockRow title="Hero Block" detail="Headline, intro copy, primary CTA" />
            <BlockRow title="Rich Text Block" detail="Editable long-form content section" />
            <BlockRow title="Feature Grid Block" detail="Three reusable feature items" />
          </div>
        </div>
      </section>
    </div>
  );
}

function SitePanel() {
  return (
    <div className="grid gap-7">
      <PanelHeader
        icon={Globe2}
        title="Site Settings"
        description="Configure site identity, publishing metadata, and starter-level preferences."
      />

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">Site Identity</h2>
          <div className="mt-4 grid gap-3">
            <SettingField label="Site name" value="Lyrix Starter" />
            <SettingField label="Production URL" value="https://example.com" />
            <SettingField label="Default locale" value="en" />
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card p-6">
          <h2 className="text-sm font-semibold">Publishing</h2>
          <div className="mt-4 grid gap-3">
            <SettingToggle label="Draft protection" enabled />
            <SettingToggle label="Search indexing" enabled />
            <SettingToggle label="Plugin execution" />
          </div>
        </div>
      </section>
    </div>
  );
}

function PanelHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <section className="border-b border-border pb-6">
      <div className="flex items-start gap-3">
        <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <Icon className="size-5" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Lyrix Studio
          </p>
          <h2 className="mt-1 text-3xl font-semibold tracking-normal">{title}</h2>
          <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </section>
  );
}

function AiQueueItem({ title, status }: { title: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background px-3 py-2">
      <span>{title}</span>
      <span className="rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
        {status}
      </span>
    </div>
  );
}

function PageRow({
  title,
  path,
  active = false,
}: {
  title: string;
  path: string;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      className={`rounded-lg border px-3 py-2.5 text-left transition-colors ${
        active
          ? "border-primary/20 bg-primary/10"
          : "border-border bg-background hover:bg-muted"
      }`}
    >
      <span className="flex items-center gap-2 text-sm font-medium">
        <FileText className="size-4 text-muted-foreground" />
        {title}
      </span>
      <span className="mt-1 block font-mono text-xs text-muted-foreground">
        {path}
      </span>
    </button>
  );
}

function BlockRow({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-lg border border-border bg-background px-5 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
      </div>
      <Boxes className="size-4 shrink-0 text-muted-foreground" />
    </div>
  );
}

function SettingField({ label, value }: { label: string; value: string }) {
  return (
    <label className="grid gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
        defaultValue={value}
      />
    </label>
  );
}

function SettingToggle({
  label,
  enabled = false,
}: {
  label: string;
  enabled?: boolean;
}) {
  return (
    <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2">
      <span className="text-sm">{label}</span>
      <span
        className={`relative h-6 w-10 rounded-full transition-colors ${
          enabled ? "bg-primary" : "bg-muted"
        }`}
      >
        <span
          className={`absolute top-1 size-4 rounded-full bg-white transition-transform ${
            enabled ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </span>
    </div>
  );
}
