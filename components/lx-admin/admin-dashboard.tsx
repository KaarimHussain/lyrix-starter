"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bot,
  Boxes,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  FileText,
  LayoutTemplate,
  Loader2,
  LogOut,
  MessageSquareText,
  MonitorSmartphone,
  Plus,
  Settings,
  Sparkles,
  Trash2,
  X,
  WandSparkles,
  Book,
  StickyNote
} from "lucide-react";
import LyrixInput from "@/components/LyrixInput";
import { Button } from "@/components/ui/button";
import { BLOCK_CATEGORIES, LyrixBlockCategory } from "@/lib/lyrix-document";

type AdminTab = "ai" | "pages" | "blocks" | "site";

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
  category?: LyrixBlockCategory;
};

type ComponentApiItem = ReusableComponent;

function isComponentApiItem(value: unknown): value is ComponentApiItem {
  if (!value || typeof value !== "object") return false;
  const c = value as Partial<ComponentApiItem>;
  return (
    typeof c.name === "string" &&
    typeof c.slug === "string" &&
    typeof c.filePath === "string"
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
      key: "pages",
      label: "Pages",
      description: "Compose pages from Lyrix blocks.",
      icon: StickyNote,
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
  const [activeTab, setActiveTab] = useState<AdminTab>("pages");
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
      {/* ── Top bar ── */}
      <header className="sticky top-0 z-40 flex h-14 items-center gap-4 border-b border-border/60 bg-card/80 px-4 backdrop-blur-md">
        <div className="flex items-center select-none">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/Logo.png"
            alt="Lyrix"
            className="h-15 w-15 shrink-0 rounded"
          />
          <div className="leading-none">
            <div className="flex gap-3 items-center">
              <span className="text-3xl font-semibold tracking-tight">Lyrix</span>
              <div className="h-4 w-px bg-primary" />
              <span className="ml-1 text-sm text-muted-foreground">Admin</span>
            </div>
          </div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href="https://lyrix-seven.vercel.app/docs" target="_blank" rel="noopener noreferrer">
              <Book className="size-3.5" />
              <span className="hidden text-xs sm:inline">Docs</span>
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline" className="gap-1.5">
            <Link href="/" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              <span className="hidden text-xs sm:inline">View site</span>
            </Link>
          </Button>
        </div>
      </header>

      {/* ── Body ── */}
      <div
        className={`grid min-h-[calc(100vh-3.5rem)] transition-[grid-template-columns] duration-200 ease-in-out ${isSidebarCollapsed
          ? "lg:grid-cols-[60px_1fr]"
          : "lg:grid-cols-[228px_1fr]"
          }`}
      >
        {/* ── Sidebar ── */}
        <aside className="flex flex-col border-b border-border/60 bg-card/40 lg:border-b-0 lg:border-r">
          {/* Workspace label row */}
          <div
            className={`flex h-10 shrink-0 items-center border-b border-border/40 px-3 ${isSidebarCollapsed ? "justify-center" : "justify-between"
              }`}
          >
            {!isSidebarCollapsed && (
              <span className="select-none text-[10px] font-mono uppercase tracking-widest text-muted-foreground/50">
                Workspace
              </span>
            )}
            <Button
              aria-label={
                isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"
              }
              size="icon-xs"
              type="button"
              variant="ghost"
              className="shrink-0 text-muted-foreground/50 hover:text-foreground"
              onClick={() => setIsSidebarCollapsed((c) => !c)}
            >
              {isSidebarCollapsed ? (
                <ChevronRight className="size-3.5" />
              ) : (
                <ChevronLeft className="size-3.5" />
              )}
            </Button>
          </div>

          {/* Nav */}
          <nav
            className="flex-1 grid content-start gap-0.5 p-2"
            aria-label="Lyrix admin sections"
          >
            {adminTabs.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                title={isSidebarCollapsed ? tab.label : undefined}
                className={`group flex h-9 w-full items-center gap-2.5 rounded-lg text-sm font-medium transition-all duration-100 ${isSidebarCollapsed ? "justify-center px-0" : "px-2.5"
                  } ${activeTab === tab.key
                    ? "bg-primary/12 text-primary ring-1 ring-inset ring-primary/20"
                    : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  }`}
              >
                <tab.icon
                  className={`size-4 shrink-0 transition-colors ${activeTab === tab.key
                    ? "text-primary"
                    : "text-muted-foreground/60 group-hover:text-foreground"
                    }`}
                />
                {!isSidebarCollapsed && (
                  <span className="truncate">{tab.label}</span>
                )}
              </button>
            ))}
          </nav>

          {/* Logout */}
          <div className="border-t border-border/40 p-2">
            <button
              type="button"
              onClick={handleLogout}
              disabled={isLoggingOut}
              title={isSidebarCollapsed ? "Log out" : undefined}
              className={`flex h-9 w-full items-center gap-2.5 rounded-lg text-sm font-medium text-muted-foreground/60 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50 ${isSidebarCollapsed ? "justify-center px-0" : "px-2.5"
                }`}
            >
              <LogOut className="size-4 shrink-0" />
              {!isSidebarCollapsed &&
                (isLoggingOut ? "Signing out…" : "Log out")}
            </button>
          </div>
        </aside>

        {/* ── Content ── */}
        <section className="min-w-0 overflow-auto px-5 py-5 lg:px-7 lg:py-6">
          {activeTab === "ai" ? <AiPanel /> : null}
          {activeTab === "pages" ? <BuilderPanel /> : null}
          {activeTab === "blocks" ? <BlocksPanel /> : null}
          {activeTab === "site" ? <SitePanel /> : null}
        </section>
      </div>
    </main>
  );
}

// ── Panels ────────────────────────────────────────────────────────────────────

function AiPanel() {
  return (
    <div className="grid gap-5">
      <PanelHeader
        icon={Bot}
        title="AI"
        description="Draft, rewrite, and structure content before it becomes real page data."
      />

      <div className="grid gap-4 xl:grid-cols-[1fr_288px]">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
            <MessageSquareText className="size-3.5" />
            Prompt Workspace
          </div>
          <textarea
            className="mt-4 min-h-52 w-full resize-none rounded-lg border border-border/60 bg-background/60 p-3.5 text-sm outline-none transition-colors placeholder:text-muted-foreground/50 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
            placeholder="Ask Lyrix AI to draft a hero section, rewrite this page, or generate block ideas…"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" className="gap-1.5">
              <WandSparkles className="size-3.5" />
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

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">AI Queue</p>
          <div className="mt-3 grid gap-2">
            <AiQueueItem title="Hero copy" status="Ready" />
            <AiQueueItem title="Feature grid ideas" status="Draft" />
            <AiQueueItem title="SEO summary" status="Waiting" />
          </div>
        </div>
      </div>
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
                typeof (page as PageApiItem).name === "string" &&
                typeof (page as PageApiItem).slug === "string" &&
                typeof (page as PageApiItem).routePath === "string"
              )
          )
          .map((page) => ({
            title: page.name,
            path: page.routePath,
            slug: page.slug,
          }));

        if (!isActive) return;

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
        if (isActive) setIsLoadingPages(false);
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
        if (
          currentPages.some((currentPage) => currentPage.path === page.routePath)
        ) {
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
    if (!page.slug || deletingSlug) return;

    const shouldDelete = window.confirm(`Delete "${page.title}"?`);
    if (!shouldDelete) return;

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
          if (currentPath !== page.path) return currentPath;
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
    <div className="grid gap-5">
      <PanelHeader
        icon={StickyNote}
        title="Pages"
        description="Manage and create pages for your website."
      />

      <div className="grid gap-4 xl:grid-cols-[268px_1fr]">
        {/* Pages list */}
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">Pages</p>
            <Button
              size="sm"
              type="button"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => {
                setIsCreatingPage(true);
                setCreatePageError("");
              }}
            >
              <Plus className="size-3.5" />
              New
            </Button>
          </div>

          <div className="mt-3 grid gap-1.5">
            {isLoadingPages && (
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Loading pages…
              </div>
            )}

            {pagesError && (
              <p className="rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-xs text-destructive">
                {pagesError}
              </p>
            )}

            {!isLoadingPages && !pagesError && pages.length === 0 && (
              <p className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-xs text-muted-foreground">
                No pages yet.
              </p>
            )}

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

        {/* Page detail */}
        <div className="rounded-xl border border-border/60 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{selectedPage.title}</p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {selectedPage.path}
              </p>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button asChild size="sm" className="gap-1.5 bg-blue-500">
                <Link
                  href={`/lx-admin/editor?path=${encodeURIComponent(selectedPage.path)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <LayoutTemplate className="size-3.5" />
                  Edit with Visual Editor
                </Link>
              </Button>
              <Button size="sm" variant="default" className="gap-1.5">
                <MonitorSmartphone className="size-3.5" />
                Preview
              </Button>
            </div>
          </div>

          <div className="p-4">
            <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border/60 bg-background/40 py-12 text-center">
              <div className="flex size-10 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground">
                <LayoutTemplate className="size-5" />
              </div>
              <p className="mt-3 text-sm font-medium">Page canvas</p>
              <p className="mt-1 text-xs text-muted-foreground">
                Reusable blocks live in the Blocks section.
              </p>
            </div>
          </div>
        </div>
      </div>

      {isCreatingPage && (
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
      )}
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

        const loadedComponents = (payload.components as unknown[]).filter(
          isComponentApiItem
        );

        if (!isActive) return;

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
            error instanceof Error ? error.message : "Could not load components."
          );
        }
      } finally {
        if (isActive) setIsLoadingComponents(false);
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
    const category = String(formData.get("category") ?? "other").trim() || "other";

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
        body: JSON.stringify({ name, slug: slug || undefined, category }),
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
    if (deletingComponentSlug) return;

    const shouldDelete = window.confirm(`Delete "${component.name}"?`);
    if (!shouldDelete) return;

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
          if (currentSlug !== component.slug) return currentSlug;
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
    <div className="grid gap-5">
      <PanelHeader
        icon={Boxes}
        title="Blocks"
        description="Create reusable components that sync from the lx-components folder."
      />

      <div className="grid gap-4 xl:grid-cols-[268px_1fr]">
        {/* Components list */}
        <div className="rounded-xl border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-medium text-muted-foreground">
              Components
            </p>
            <Button
              size="sm"
              type="button"
              variant="outline"
              className="h-7 gap-1 px-2 text-xs"
              onClick={() => {
                setIsCreatingComponent(true);
                setCreateComponentError("");
              }}
            >
              <Plus className="size-3.5" />
              Create
            </Button>
          </div>

          <div className="mt-3 grid gap-1.5">
            {isLoadingComponents && (
              <div className="flex items-center gap-2 rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-xs text-muted-foreground">
                <Loader2 className="size-3.5 animate-spin" />
                Loading components…
              </div>
            )}

            {componentsError && (
              <p className="rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-xs text-destructive">
                {componentsError}
              </p>
            )}

            {!isLoadingComponents &&
              !componentsError &&
              components.length === 0 && (
                <p className="rounded-lg border border-border/60 bg-background/60 px-3 py-2.5 text-xs text-muted-foreground">
                  No components yet.
                </p>
              )}

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

        {/* Component detail */}
        <div className="rounded-xl border border-border/60 bg-card">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/60 px-4 py-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {selectedComponent.name}
              </p>
              <p className="truncate font-mono text-xs text-muted-foreground">
                {selectedComponent.slug
                  ? `lx-components/${selectedComponent.slug}/component.tsx`
                  : "lx-components"}
              </p>
            </div>
            {selectedComponent.slug && (
              <Link
                href={`/lx-admin/block-editor?slug=${encodeURIComponent(selectedComponent.slug)}`}
                className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/25 bg-primary/8 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/15"
              >
                <WandSparkles className="size-3.5" />
                Edit with Block Editor
              </Link>
            )}
          </div>

          <div className="p-4">
            <div className="rounded-lg border border-dashed border-border/60 bg-background/40 p-5">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border/60 bg-card text-muted-foreground">
                  <Boxes className="size-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium">Hybrid component source</p>
                  <p className="mt-1 text-xs leading-5 text-muted-foreground">
                    Components created here are real files. Components created in
                    your editor under{" "}
                    <code className="font-mono text-[11px]">
                      lx-components/*/component.tsx
                    </code>{" "}
                    will appear here after reload.
                  </p>
                  {selectedComponent.filePath && (
                    <p className="mt-3 truncate font-mono text-[11px] text-muted-foreground/70">
                      {selectedComponent.filePath}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {isCreatingComponent && (
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
      )}
    </div>
  );
}

function SitePanel() {
  return (
    <div className="grid gap-5">
      <PanelHeader
        icon={Settings}
        title="Site Settings"
        description="Configure site identity, publishing metadata, and starter-level preferences."
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">
            Site Identity
          </p>
          <div className="mt-4 grid gap-3">
            <SettingField label="Site name" value="Lyrix Starter" />
            <SettingField label="Production URL" value="https://example.com" />
            <SettingField label="Default locale" value="en" />
          </div>
        </div>

        <div className="rounded-xl border border-border/60 bg-card p-5">
          <p className="text-xs font-medium text-muted-foreground">Publishing</p>
          <div className="mt-4 grid gap-3">
            <SettingToggle label="Draft protection" enabled />
            <SettingToggle label="Search indexing" enabled />
            <SettingToggle label="Plugin execution" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Shared components ──────────────────────────────────────────────────────────

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
    <div className="flex items-start gap-3 border-b border-border/60 pb-5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-primary ring-1 ring-inset ring-primary/20">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 pt-0.5">
        <h1 className="text-lg font-semibold leading-none tracking-tight">
          {title}
        </h1>
        <p className="mt-1.5 max-w-lg text-xs leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </div>
  );
}

function AiQueueItem({ title, status }: { title: string; status: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border/60 bg-background/60 px-3 py-2">
      <span className="text-sm">{title}</span>
      <span className="rounded-full border border-border/60 bg-muted px-2 py-0.5 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
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
  const categoryColor =
    BLOCK_CATEGORIES.find((c) => c.slug === component.category)?.color ?? "#6b7280";

  return (
    <div
      className={`group grid grid-cols-[1fr_auto] items-center gap-1 rounded-lg border transition-colors ${
        active
          ? "border-primary/20 bg-primary/8"
          : "border-border/60 bg-background/40 hover:bg-muted/40"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: categoryColor }}
            aria-hidden
          />
          <span className="truncate">{component.name}</span>
        </span>
        <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground/70">
          {component.slug}
        </span>
      </button>
      <button
        aria-label={`Delete ${component.name}`}
        type="button"
        disabled={isDeleting}
        onClick={onDelete}
        className="mr-1.5 flex size-7 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
      >
        {isDeleting ? (
          <Loader2 className="size-3.5 animate-spin" />
        ) : (
          <Trash2 className="size-3.5" />
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
  const [selectedCategory, setSelectedCategory] = useState<LyrixBlockCategory>("other");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const activeCategory = BLOCK_CATEGORIES.find((c) => c.slug === selectedCategory)!;

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        className="w-full max-w-md rounded-xl border border-border/60 bg-card p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Create Block</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add a reusable visual block to lx-components.
            </p>
          </div>
          <Button
            aria-label="Close"
            disabled={isSubmittingComponent}
            size="icon-xs"
            type="button"
            variant="ghost"
            className="shrink-0 text-muted-foreground"
            onClick={onClose}
          >
            <X className="size-4" />
          </Button>
        </div>

        <div className="mt-5 grid gap-4">
          <LyrixInput
            autoFocus
            inputSize="sm"
            label="Block name"
            name="name"
            placeholder="Pricing Cards"
          />
          <LyrixInput
            hint="Optional. Generated from name if empty."
            inputSize="sm"
            label="Slug"
            name="slug"
            placeholder="pricing-cards"
          />

          {/* Category selector */}
          <div className="grid gap-1.5">
            <span className="text-xs font-medium">Category</span>
            <div className="relative">
              <button
                type="button"
                onClick={() => setIsDropdownOpen((open) => !open)}
                className="flex h-9 w-full items-center gap-2.5 rounded-lg border border-border bg-background px-3 text-sm transition-colors hover:border-primary focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
              >
                <span
                  className="size-3 shrink-0 rounded-full"
                  style={{ backgroundColor: activeCategory.color }}
                />
                <span className="flex-1 text-left">{activeCategory.label}</span>
                <ChevronRight
                  className={`size-4 shrink-0 text-muted-foreground transition-transform ${isDropdownOpen ? "rotate-90" : ""}`}
                />
              </button>

              {isDropdownOpen && (
                <div className="absolute left-0 right-0 top-[calc(100%+4px)] z-10 rounded-lg border border-border bg-card p-1 shadow-lg">
                  <div className="grid grid-cols-3 gap-1">
                    {BLOCK_CATEGORIES.map((cat) => (
                      <button
                        key={cat.slug}
                        type="button"
                        onClick={() => {
                          setSelectedCategory(cat.slug);
                          setIsDropdownOpen(false);
                        }}
                        className={`flex items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors ${
                          selectedCategory === cat.slug
                            ? "bg-primary/10 font-medium text-primary"
                            : "text-foreground hover:bg-muted"
                        }`}
                      >
                        <span
                          className="size-2.5 shrink-0 rounded-full"
                          style={{ backgroundColor: cat.color }}
                        />
                        {cat.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <input type="hidden" name="category" value={selectedCategory} />
          </div>

          {createComponentError && (
            <p className="rounded-lg border border-destructive/25 bg-destructive/8 px-3 py-2 text-xs text-destructive">
              {createComponentError}
            </p>
          )}
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
                <Loader2 className="size-3.5 animate-spin" />
                Creating…
              </>
            ) : (
              "Create Block"
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
      className={`group grid grid-cols-[1fr_auto] items-center gap-1 rounded-lg border transition-colors ${active
        ? "border-primary/20 bg-primary/8"
        : "border-border/60 bg-background/40 hover:bg-muted/40"
        }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="min-w-0 px-3 py-2 text-left"
      >
        <span className="flex items-center gap-2 text-sm font-medium">
          <FileText className="size-3.5 shrink-0 text-muted-foreground" />
          <span className="truncate">{title}</span>
        </span>
        <span className="mt-0.5 block truncate font-mono text-[11px] text-muted-foreground/70">
          {path}
        </span>
      </button>
      {canDelete && (
        <button
          aria-label={`Delete ${title}`}
          type="button"
          disabled={isDeleting}
          onClick={onDelete}
          className="mr-1.5 flex size-7 items-center justify-center rounded-md text-muted-foreground/50 transition-colors hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
        >
          {isDeleting ? (
            <Loader2 className="size-3.5 animate-spin" />
          ) : (
            <Trash2 className="size-3.5" />
          )}
        </button>
      )}
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
      className="fixed inset-0 z-50 grid place-items-center bg-background/60 px-4 backdrop-blur-sm"
      role="presentation"
      onMouseDown={onClose}
    >
      <form
        className="w-full max-w-sm rounded-xl border border-border/60 bg-card p-5 shadow-2xl"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={onSubmit}
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Create Page</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Add a new route to this starter project.
            </p>
          </div>
          <Button
            aria-label="Close"
            disabled={isSubmittingPage}
            size="icon-xs"
            type="button"
            variant="ghost"
            className="shrink-0 text-muted-foreground"
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
            hint="Optional. Generated from name if empty."
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
                <Loader2 className="size-3.5 animate-spin" />
                Creating…
              </>
            ) : (
              "Create"
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
      <span className="text-xs font-medium text-muted-foreground">{label}</span>
      <input
        className="h-9 w-full rounded-lg border border-border/60 bg-background/60 px-3 text-sm outline-none transition-colors focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20"
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
    <div className="flex items-center justify-between rounded-lg border border-border/60 bg-background/60 px-3 py-2.5">
      <span className="text-sm">{label}</span>
      <span
        className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? "bg-primary" : "bg-muted"
          }`}
      >
        <span
          className={`absolute top-0.5 size-4 rounded-full bg-white shadow-sm transition-transform ${enabled ? "translate-x-4" : "translate-x-0.5"
            }`}
        />
      </span>
    </div>
  );
}
