"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Boxes,
  ChevronLeft,
  ChevronRight,
  FileText,
  Globe2,
  LayoutTemplate,
  Loader2,
  LogOut,
  MessageSquareText,
  MonitorSmartphone,
  PanelLeft,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  X,
  WandSparkles,
} from "lucide-react";
import LyrixInput from "@/components/LyrixInput";
import { Button } from "@/components/ui/button";

type AdminTab = "ai" | "builder" | "blocks" | "site";

type BuilderPage = {
  title: string;
  path: string;
  slug: string;
};

type PageApiItem = {
  name: string;
  slug: string;
  routePath: string;
};

type ReusableComponent = {
  name: string;
  slug: string;
  filePath: string;
};

type ComponentApiItem = ReusableComponent;

function isComponentApiItem(value: unknown): value is ComponentApiItem {
  if (!value || typeof value !== "object") {
    return false;
  }

  const component = value as Partial<ComponentApiItem>;

  return (
    typeof component.name === "string" &&
    typeof component.slug === "string" &&
    typeof component.filePath === "string"
  );
}

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
    key: "blocks",
    label: "Blocks",
    description: "Create reusable project components.",
    icon: Boxes,
  },
  {
    key: "site",
    label: "Site",
    description: "Manage project settings and publishing.",
    icon: Settings,
  },
];

export function LxAdminDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("builder");
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    try {
      await fetch("/api/lx-admin/logout", { method: "POST" });
    } finally {
      router.push("/lx-admin/login");
      router.refresh();
    }
  }

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
          <Button asChild size="sm" variant="outline">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              View site
            </Link>
          </Button>
        </div>
      </header>

      <div
        className={`grid min-h-[calc(100vh-3.5rem)] ${
          isSidebarCollapsed
            ? "lg:grid-cols-[76px_minmax(0,1fr)]"
            : "lg:grid-cols-[220px_minmax(0,1fr)]"
        }`}
      >
        <aside className="flex flex-col border-b border-border bg-sidebar p-2 transition-[width] lg:border-b-0 lg:border-r">
          <div>
            <div
              className={`flex items-center gap-2 px-2 py-2 ${
                isSidebarCollapsed ? "justify-center" : "justify-between"
              }`}
            >
              {!isSidebarCollapsed ? (
                <div>
                  <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                    Workspace
                  </p>
                  <h1 className="mt-1 text-base font-semibold">Editor Dashboard</h1>
                </div>
              ) : null}
              <Button
                aria-label={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                size="icon-xs"
                type="button"
                variant="ghost"
                onClick={() => setIsSidebarCollapsed((current) => !current)}
              >
                {isSidebarCollapsed ? (
                  <ChevronRight className="size-4" />
                ) : (
                  <ChevronLeft className="size-4" />
                )}
              </Button>
            </div>

            <nav className="grid gap-1" aria-label="Lyrix admin sections">
              {adminTabs.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  title={isSidebarCollapsed ? tab.label : undefined}
                  className={`flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium transition-colors ${
                    activeTab === tab.key
                      ? "bg-primary text-primary-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  } ${isSidebarCollapsed ? "justify-center px-2" : ""}`}
                >
                  <tab.icon className="size-4 shrink-0" />
                  {!isSidebarCollapsed ? tab.label : null}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-4 border-t border-border pt-3 lg:mt-auto">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title={isSidebarCollapsed ? "Log out" : undefined}
              className={`flex h-9 w-full items-center gap-2 rounded-lg px-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:pointer-events-none disabled:opacity-60 ${
                isSidebarCollapsed ? "justify-center px-2" : ""
              }`}
            >
              <LogOut className="size-4 shrink-0" />
              {!isSidebarCollapsed ? (isLoggingOut ? "Signing out..." : "Log out") : null}
            </button>
          </div>
        </aside>

        <section className="min-w-0 px-4 py-4 sm:px-5 lg:px-6 lg:py-5">
          {activeTab === "ai" ? <AiPanel /> : null}
          {activeTab === "builder" ? <BuilderPanel /> : null}
          {activeTab === "blocks" ? <BlocksPanel /> : null}
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
  const [pages, setPages] = useState<BuilderPage[]>([]);
  const [selectedPath, setSelectedPath] = useState("/");
  const [isLoadingPages, setIsLoadingPages] = useState(true);
  const [pagesError, setPagesError] = useState("");
  const [isCreatingPage, setIsCreatingPage] = useState(false);
  const [isSubmittingPage, setIsSubmittingPage] = useState(false);
  const [deletingSlug, setDeletingSlug] = useState("");
  const [createPageError, setCreatePageError] = useState("");

  const selectedPage =
    pages.find((page) => page.path === selectedPath) ??
    pages[0] ?? { title: "No pages found", path: "/", slug: "" };

  useEffect(() => {
    let isActive = true;

    async function loadPages() {
      setIsLoadingPages(true);
      setPagesError("");

      try {
        const response = await fetch("/api/lx-admin/pages");
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || "Could not load pages.");
        }

        if (!Array.isArray(payload.pages)) {
          throw new Error("The pages response was invalid.");
        }

        const apiPages: unknown[] = payload.pages;
        const loadedPages = apiPages
          .filter(
            (page: unknown): page is PageApiItem =>
              Boolean(
                page &&
                  typeof page === "object" &&
                  "name" in page &&
                  "slug" in page &&
                  "routePath" in page &&
                  typeof page.name === "string" &&
                  typeof page.slug === "string" &&
                  typeof page.routePath === "string"
              )
          )
          .map((page) => ({
            title: page.name,
            path: page.routePath,
            slug: page.slug,
          }));

        if (!isActive) {
          return;
        }

        setPages(loadedPages);
        setSelectedPath((currentPath) => {
          if (loadedPages.some((page) => page.path === currentPath)) {
            return currentPath;
          }

          return loadedPages[0]?.path ?? "/";
        });
      } catch (error) {
        if (isActive) {
          setPagesError(
            error instanceof Error ? error.message : "Could not load pages."
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingPages(false);
        }
      }
    }

    loadPages();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleCreatePage(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();

    if (!name) {
      setCreatePageError("Enter a page name.");
      return;
    }

    setIsSubmittingPage(true);
    setCreatePageError("");

    try {
      const response = await fetch("/api/lx-admin/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug || undefined }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setCreatePageError(payload.error || "Could not create that page.");
        return;
      }

      const page = payload.page;

      if (
        !page ||
        typeof page.name !== "string" ||
        typeof page.routePath !== "string"
      ) {
        setCreatePageError("The page was created, but the response was invalid.");
        return;
      }

      setPages((currentPages) => {
        if (currentPages.some((currentPage) => currentPage.path === page.routePath)) {
          return currentPages;
        }

        return [
          ...currentPages,
          {
            title: page.name,
            path: page.routePath,
            slug: typeof page.slug === "string" ? page.slug : slug,
          },
        ];
      });
      setSelectedPath(page.routePath);
      setIsCreatingPage(false);
      event.currentTarget.reset();
    } catch {
      setCreatePageError("Could not reach the page creation service.");
    } finally {
      setIsSubmittingPage(false);
    }
  }

  async function handleDeletePage(page: BuilderPage) {
    if (!page.slug || deletingSlug) {
      return;
    }

    const shouldDelete = window.confirm(`Delete "${page.title}"?`);

    if (!shouldDelete) {
      return;
    }

    setDeletingSlug(page.slug);
    setPagesError("");

    try {
      const response = await fetch("/api/lx-admin/pages", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: page.slug }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setPagesError(payload.error || "Could not delete that page.");
        return;
      }

      setPages((currentPages) => {
        const nextPages = currentPages.filter(
          (currentPage) => currentPage.slug !== page.slug
        );

        setSelectedPath((currentPath) => {
          if (currentPath !== page.path) {
            return currentPath;
          }

          return nextPages[0]?.path ?? "/";
        });

        return nextPages;
      });
    } catch {
      setPagesError("Could not reach the page deletion service.");
    } finally {
      setDeletingSlug("");
    }
  }

  return (
    <div className="grid gap-4">
      <PanelHeader
        icon={LayoutTemplate}
        title="Builder"
        description="Arrange pages visually while keeping every block backed by real React components."
      />

      <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Pages</h2>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreatingPage(true);
                setCreatePageError("");
              }}
            >
              <Plus className="size-4" />
              New
            </Button>
          </div>

          <div className="mt-3 grid gap-2">
            {isLoadingPages ? (
              <p className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading pages
              </p>
            ) : null}

            {pagesError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {pagesError}
              </p>
            ) : null}

            {!isLoadingPages && !pagesError && pages.length === 0 ? (
              <p className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                No pages found.
              </p>
            ) : null}

            {pages.map((page) => (
              <PageRow
                key={page.path}
                active={page.path === selectedPath}
                canDelete={Boolean(page.slug)}
                isDeleting={deletingSlug === page.slug}
                title={page.title}
                path={page.path}
                onSelect={() => setSelectedPath(page.path)}
                onDelete={() => handleDeletePage(page)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">{selectedPage.title}</h2>
              <p className="text-xs text-muted-foreground">{selectedPage.path}</p>
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <Link
                  href={`/lx-admin/editor?path=${encodeURIComponent(selectedPage.path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LayoutTemplate className="size-4" />
                  Edit the Page
                </Link>
              </Button>
              <Button size="sm" variant="outline">
                <MonitorSmartphone className="size-4" />
                Preview
              </Button>
            </div>
          </div>

          <div className="grid gap-3 p-4">
            <div className="rounded-lg border border-dashed border-border bg-background px-5 py-7 text-center">
              <LayoutTemplate className="mx-auto size-5 text-muted-foreground" />
              <p className="mt-3 text-sm font-medium">Page canvas</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Reusable blocks now live in the Blocks section.
              </p>
            </div>
          </div>
        </div>
      </section>

      {isCreatingPage ? (
        <PageCreateModal
          createPageError={createPageError}
          isSubmittingPage={isSubmittingPage}
          onClose={() => {
            if (!isSubmittingPage) {
              setIsCreatingPage(false);
              setCreatePageError("");
            }
          }}
          onSubmit={handleCreatePage}
        />
      ) : null}

    </div>
  );
}

function BlocksPanel() {
  const [components, setComponents] = useState<ReusableComponent[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [isLoadingComponents, setIsLoadingComponents] = useState(true);
  const [componentsError, setComponentsError] = useState("");
  const [isCreatingComponent, setIsCreatingComponent] = useState(false);
  const [isSubmittingComponent, setIsSubmittingComponent] = useState(false);
  const [deletingComponentSlug, setDeletingComponentSlug] = useState("");
  const [createComponentError, setCreateComponentError] = useState("");

  useEffect(() => {
    let isActive = true;

    async function loadComponents() {
      setIsLoadingComponents(true);
      setComponentsError("");

      try {
        const response = await fetch("/api/lx-admin/components");
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || "Could not load components.");
        }

        if (!Array.isArray(payload.components)) {
          throw new Error("The components response was invalid.");
        }

        const apiComponents: unknown[] = payload.components;
        const loadedComponents = apiComponents.filter(isComponentApiItem);

        if (!isActive) {
          return;
        }

        setComponents(loadedComponents);
        setSelectedSlug((currentSlug) => {
          if (
            loadedComponents.some((component) => component.slug === currentSlug)
          ) {
            return currentSlug;
          }

          return loadedComponents[0]?.slug ?? "";
        });
      } catch (error) {
        if (isActive) {
          setComponentsError(
            error instanceof Error
              ? error.message
              : "Could not load components."
          );
        }
      } finally {
        if (isActive) {
          setIsLoadingComponents(false);
        }
      }
    }

    loadComponents();

    return () => {
      isActive = false;
    };
  }, []);

  async function handleCreateComponent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const slug = String(formData.get("slug") ?? "").trim();

    if (!name) {
      setCreateComponentError("Enter a component name.");
      return;
    }

    setIsSubmittingComponent(true);
    setCreateComponentError("");

    try {
      const response = await fetch("/api/lx-admin/components", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, slug: slug || undefined }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setCreateComponentError(
          payload.error || "Could not create that component."
        );
        return;
      }

      if (!isComponentApiItem(payload.component)) {
        setCreateComponentError(
          "The component was created, but the response was invalid."
        );
        return;
      }

      setComponents((currentComponents) => {
        if (
          currentComponents.some(
            (component) => component.slug === payload.component.slug
          )
        ) {
          return currentComponents;
        }

        return [...currentComponents, payload.component].sort((a, b) =>
          a.name.localeCompare(b.name)
        );
      });
      setSelectedSlug(payload.component.slug);
      setIsCreatingComponent(false);
      event.currentTarget.reset();
    } catch {
      setCreateComponentError("Could not reach the component creation service.");
    } finally {
      setIsSubmittingComponent(false);
    }
  }

  async function handleDeleteComponent(component: ReusableComponent) {
    if (deletingComponentSlug) {
      return;
    }

    const shouldDelete = window.confirm(`Delete "${component.name}"?`);

    if (!shouldDelete) {
      return;
    }

    setDeletingComponentSlug(component.slug);
    setComponentsError("");

    try {
      const response = await fetch("/api/lx-admin/components", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: component.slug }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        setComponentsError(payload.error || "Could not delete that component.");
        return;
      }

      setComponents((currentComponents) => {
        const nextComponents = currentComponents.filter(
          (currentComponent) => currentComponent.slug !== component.slug
        );

        setSelectedSlug((currentSlug) => {
          if (currentSlug !== component.slug) {
            return currentSlug;
          }

          return nextComponents[0]?.slug ?? "";
        });

        return nextComponents;
      });
    } catch {
      setComponentsError("Could not reach the component deletion service.");
    } finally {
      setDeletingComponentSlug("");
    }
  }

  const selectedComponent =
    components.find((component) => component.slug === selectedSlug) ??
    components[0] ?? { name: "No component selected", slug: "", filePath: "" };

  return (
    <div className="grid gap-4">
      <PanelHeader
        icon={Boxes}
        title="Blocks"
        description="Create reusable components that sync from the lx-components folder."
      />

      <section className="grid gap-4 xl:grid-cols-[280px_minmax(0,1fr)]">
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold">Components</h2>
            <Button
              size="sm"
              type="button"
              variant="outline"
              onClick={() => {
                setIsCreatingComponent(true);
                setCreateComponentError("");
              }}
            >
              <Plus className="size-4" />
              Create
            </Button>
          </div>

          <div className="mt-3 grid gap-2">
            {isLoadingComponents ? (
              <p className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading components
              </p>
            ) : null}

            {componentsError ? (
              <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2.5 text-sm text-destructive">
                {componentsError}
              </p>
            ) : null}

            {!isLoadingComponents &&
            !componentsError &&
            components.length === 0 ? (
              <p className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-muted-foreground">
                No components found.
              </p>
            ) : null}

            {components.map((component) => (
              <ComponentRow
                key={component.slug}
                active={component.slug === selectedSlug}
                component={component}
                isDeleting={deletingComponentSlug === component.slug}
                onDelete={() => handleDeleteComponent(component)}
                onSelect={() => setSelectedSlug(component.slug)}
              />
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-border bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold">{selectedComponent.name}</h2>
              <p className="font-mono text-xs text-muted-foreground">
                {selectedComponent.slug
                  ? `lx-components/${selectedComponent.slug}/component.tsx`
                  : "lx-components"}
              </p>
            </div>
          </div>

          <div className="grid gap-3 p-4">
            <div className="rounded-lg border border-dashed border-border bg-background px-5 py-7">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
                  <Boxes className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Hybrid component source</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Components created here are real files. Components created
                    in your editor under `lx-components/*/component.tsx` will
                    appear here after reload.
                  </p>
                  {selectedComponent.filePath ? (
                    <p className="mt-3 truncate font-mono text-xs text-muted-foreground">
                      {selectedComponent.filePath}
                    </p>
                  ) : null}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isCreatingComponent ? (
        <ComponentCreateModal
          createComponentError={createComponentError}
          isSubmittingComponent={isSubmittingComponent}
          onClose={() => {
            if (!isSubmittingComponent) {
              setIsCreatingComponent(false);
              setCreateComponentError("");
            }
          }}
          onSubmit={handleCreateComponent}
        />
      ) : null}
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
    <section className="border-b border-border pb-4">
      <div className="flex items-start gap-3">
        <div className="flex size-9 items-center justify-center rounded-lg border border-primary/20 bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
            Lyrix Studio
          </p>
          <h2 className="mt-1 text-2xl font-semibold tracking-normal">{title}</h2>
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

function ComponentRow({
  component,
  active = false,
  isDeleting,
  onDelete,
  onSelect,
}: {
  component: ReusableComponent;
  active?: boolean;
  isDeleting: boolean;
  onDelete: () => void;
  onSelect: () => void;
}) {
  return (
    <div
      className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 rounded-lg border transition-colors ${
        active
          ? "border-primary/20 bg-primary/10"
          : "border-border bg-background hover:bg-muted"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <Boxes className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{component.name}</span>
        </span>
        <span className="mt-1 block truncate font-mono text-xs text-muted-foreground">
          {component.slug}
        </span>
      </button>
      <button
        aria-label={`Delete ${component.name}`}
        type="button"
        disabled={isDeleting}
        onClick={onDelete}
        className="mr-2 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-60"
      >
        {isDeleting ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Trash2 className="size-4" />
        )}
      </button>
    </div>
  );
}

function ComponentCreateModal({
  createComponentError,
  isSubmittingComponent,
  onClose,
  onSubmit,
}: {
  createComponentError: string;
  isSubmittingComponent: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Create Component</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a reusable block to lx-components.
            </p>
          </div>
          <Button
            aria-label="Close create component modal"
            disabled={isSubmittingComponent}
            size="icon-xs"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          <LyrixInput
            autoFocus
            inputSize="sm"
            label="Component name"
            name="name"
            placeholder="Pricing Cards"
          />
          <LyrixInput
            error={createComponentError}
            hint="Optional. Generated from the name if empty."
            inputSize="sm"
            label="Slug"
            name="slug"
            placeholder="pricing-cards"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            disabled={isSubmittingComponent}
            size="sm"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button disabled={isSubmittingComponent} size="sm" type="submit">
            {isSubmittingComponent ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating
              </>
            ) : (
              "Create Component"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

function PageRow({
  title,
  path,
  active = false,
  canDelete,
  isDeleting,
  onSelect,
  onDelete,
}: {
  title: string;
  path: string;
  active?: boolean;
  canDelete: boolean;
  isDeleting: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <div
      className={`group grid grid-cols-[minmax(0,1fr)_auto] items-center gap-1 rounded-lg border transition-colors ${
        active
          ? "border-primary/20 bg-primary/10"
          : "border-border bg-background hover:bg-muted"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{title}</span>
        </span>
        <span className="mt-1 block truncate font-mono text-xs text-muted-foreground">
          {path}
        </span>
      </button>
      {canDelete ? (
        <button
          aria-label={`Delete ${title}`}
          type="button"
          disabled={isDeleting}
          onClick={onDelete}
          className="mr-2 flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-60"
        >
          {isDeleting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Trash2 className="size-4" />
          )}
        </button>
      ) : null}
    </div>
  );
}

function PageCreateModal({
  createPageError,
  isSubmittingPage,
  onClose,
  onSubmit,
}: {
  createPageError: string;
  isSubmittingPage: boolean;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-foreground/25 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        className="w-full max-w-md rounded-lg border border-border bg-card p-4 shadow-xl"
        onMouseDown={(event) => event.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold">Create Page</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Add a new route to this starter project.
            </p>
          </div>
          <Button
            aria-label="Close create page modal"
            disabled={isSubmittingPage}
            size="icon-xs"
            type="button"
            variant="ghost"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-4 grid gap-3">
          <LyrixInput
            autoFocus
            inputSize="sm"
            label="Page name"
            name="name"
            placeholder="About Us"
          />
          <LyrixInput
            error={createPageError}
            hint="Optional. Generated from the name if empty."
            inputSize="sm"
            label="Slug"
            name="slug"
            placeholder="about-us"
          />
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <Button
            disabled={isSubmittingPage}
            size="sm"
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button disabled={isSubmittingPage} size="sm" type="submit">
            {isSubmittingPage ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating
              </>
            ) : (
              "Create Page"
            )}
          </Button>
        </div>
      </form>
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
