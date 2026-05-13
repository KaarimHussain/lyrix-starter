"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Layers3,
  LayoutGrid,
  Loader2,
  Plus,
  Save,
  Search,
} from "lucide-react";
import {
  createElementFromTemplate,
  isLyrixBlockDocument,
  LyrixBlockDocument,
  LyrixElement,
  LyrixElementType,
} from "@/lib/lyrix-document";
import {
  deleteElementById,
  DropTarget,
  DropZone,
  EditorElementFrame,
  findElementById,
  findElementLocation,
  findFirstElement,
  insertElementAtTarget,
  isDescendantOf,
  isDropTargetActive,
  isLyrixElementType,
  LayersPanel,
  PanelMode,
  PanelTitle,
  SaveState,
  TopbarIcon,
  updateElementById,
  Viewport,
  viewportOptions,
  widgetGroups,
} from "@/components/lx-admin/editor-shared";

// ── BlockEditorShell ──────────────────────────────────────────────────────────

export function BlockEditorShell({ blockSlug }: { blockSlug: string }) {
  const [document, setDocument] = useState<LyrixBlockDocument | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [panelMode, setPanelMode] = useState<PanelMode>("elements");
  const [draggedWidgetType, setDraggedWidgetType] = useState<LyrixElementType | null>(null);
  const [draggedElementId, setDraggedElementId] = useState("");
  const [dropTarget, setDropTarget] = useState<DropTarget | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [saveState, setSaveState] = useState<SaveState>("idle");

  const selectedElement = useMemo(
    () => findElementById(document?.elements ?? [], selectedId),
    [document, selectedId]
  );
  const activeViewport = viewportOptions.find((o) => o.key === viewport) ?? viewportOptions[0];

  useEffect(() => {
    let isActive = true;

    async function loadDocument() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/lx-admin/block-document?slug=${encodeURIComponent(blockSlug)}`
        );
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) throw new Error(payload.error || "Could not load this block.");
        if (!isLyrixBlockDocument(payload.document)) throw new Error("The block document was invalid.");
        if (!isActive) return;

        setDocument(payload.document);
        setSelectedId(payload.document.elements[0]?.id ?? "");
      } catch (loadError) {
        if (isActive) {
          setError(loadError instanceof Error ? loadError.message : "Could not load this block.");
        }
      } finally {
        if (isActive) setIsLoading(false);
      }
    }

    loadDocument();
    return () => { isActive = false; };
  }, [blockSlug]);

  function insertElement(type: LyrixElementType, target: DropTarget) {
    const element = createElementFromTemplate(type);

    setDocument((current) => {
      if (!current) return current;
      return { ...current, elements: insertElementAtTarget(current.elements, target, element) };
    });
    setSelectedId(element.id);
    setPanelMode("layers");
    setDropTarget(null);
    setDraggedWidgetType(null);
    setSaveState("idle");
  }

  function addSection(type: LyrixElementType) {
    insertElement(type, { parentId: null, index: document?.elements.length ?? 0 });
  }

  function handleDropAtIndex(event: React.DragEvent<HTMLElement>, target: DropTarget) {
    event.preventDefault();
    event.stopPropagation();

    const elementId = event.dataTransfer.getData("application/x-lyrix-element");
    if (elementId) { moveElement(elementId, target); return; }

    const type =
      (event.dataTransfer.getData("application/x-lyrix-widget") as LyrixElementType) ||
      draggedWidgetType;
    if (isLyrixElementType(type)) insertElement(type, target);

    setDropTarget(null);
    setDraggedWidgetType(null);
  }

  function moveElement(elementId: string, target: DropTarget) {
    setDocument((current) => {
      if (!current) return current;

      const source = findElementLocation(current.elements, elementId);
      if (!source || isDescendantOf(source.element, target.parentId)) return current;

      const adjustedTarget = {
        ...target,
        index:
          source.parentId === target.parentId && source.index < target.index
            ? target.index - 1
            : target.index,
      };

      if (
        source.parentId === adjustedTarget.parentId &&
        source.index === adjustedTarget.index
      ) {
        return current;
      }

      return {
        ...current,
        elements: insertElementAtTarget(
          deleteElementById(current.elements, elementId),
          adjustedTarget,
          source.element
        ),
      };
    });

    setSelectedId(elementId);
    setPanelMode("layers");
    setDropTarget(null);
    setDraggedElementId("");
    setSaveState("idle");
  }

  function updateSelectedElement(props: Partial<LyrixElement["props"]>) {
    setDocument((current) => {
      if (!current) return current;
      return { ...current, elements: updateElementById(current.elements, selectedId, props) };
    });
    setSaveState("idle");
  }

  function deleteElement(elementId: string) {
    if (!elementId) return;

    setDocument((current) => {
      if (!current) return current;
      const nextElements = deleteElementById(current.elements, elementId);
      setSelectedId(findFirstElement(nextElements)?.id ?? "");
      return { ...current, elements: nextElements };
    });
    setSaveState("idle");
  }

  async function saveDocument() {
    if (!document || saveState === "saving") return;

    setSaveState("saving");
    setError("");

    try {
      const response = await fetch("/api/lx-admin/block-document", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: blockSlug, document }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(payload.error || "Could not save this block.");
      if (!isLyrixBlockDocument(payload.document)) {
        throw new Error("The saved block document was invalid.");
      }

      setDocument(payload.document);
      setSaveState("saved");
    } catch (saveError) {
      setSaveState("error");
      setError(saveError instanceof Error ? saveError.message : "Could not save this block.");
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-[#d8d4ce] text-foreground">
      <header className="grid h-12 grid-cols-[auto_minmax(0,1fr)_auto] border-b border-primary/70 bg-primary text-primary-foreground">
        <div className="flex items-center border-r border-primary-foreground/15">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex h-12 w-12 items-center justify-center border-r border-primary-foreground/10 transition-colors hover:bg-primary-foreground/10"
              aria-label="Block editor menu"
            >
              <NextImage
                alt=""
                className="size-7 rounded-full bg-white"
                height={28}
                src="/favicon.png"
                width={28}
              />
            </button>
            {isMenuOpen ? (
              <div className="absolute left-2 top-12 z-30 w-48 rounded-lg border border-border bg-card p-1 text-foreground shadow-xl">
                <Link
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  href="/lx-admin"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Back to Admin
                </Link>
              </div>
            ) : null}
          </div>

          <TopbarIcon
            active={panelMode === "elements"}
            label="Elements"
            onClick={() => setPanelMode("elements")}
          >
            <Plus className="size-5" />
          </TopbarIcon>
          <TopbarIcon
            active={panelMode === "layers"}
            label="Layers"
            onClick={() => setPanelMode("layers")}
          >
            <Layers3 className="size-5" />
          </TopbarIcon>
        </div>

        <div className="flex min-w-0 items-center justify-center gap-4">
          <div className="min-w-0 text-center">
            {document ? (
              <p className="truncate text-sm font-semibold text-primary-foreground">
                {document.name}
              </p>
            ) : null}
            <p className="truncate font-mono text-xs text-primary-foreground/55">
              lx-components/{blockSlug}
            </p>
          </div>

          <div className="flex h-12 items-center gap-1 border-l border-primary-foreground/15 px-3">
            {viewportOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setViewport(option.key)}
                className={`flex size-9 items-center justify-center border-b-2 transition-colors ${
                  viewport === option.key
                    ? "border-primary-foreground text-primary-foreground"
                    : "border-transparent text-primary-foreground/65 hover:text-primary-foreground"
                }`}
                aria-label={option.label}
                title={option.label}
              >
                <option.icon className="size-4" />
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center">
          <button
            disabled={!document || saveState === "saving"}
            type="button"
            onClick={saveDocument}
            className="flex h-12 items-center gap-2 border-l border-primary-foreground/15 bg-primary-foreground px-5 text-sm font-semibold text-primary transition-colors hover:bg-primary-foreground/90 disabled:pointer-events-none disabled:opacity-60"
          >
            {saveState === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saveState === "saved" ? "Saved" : "Save Block"}
          </button>
        </div>
      </header>

      <div className="grid h-[calc(100vh-3rem)] grid-cols-[clamp(300px,22vw,340px)_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-hidden border-r border-black/20 bg-[#fbfaf7]">
          {panelMode === "elements" ? (
            <BlockElementsPanel
              onAddSection={addSection}
              onDragEnd={() => {
                setDraggedWidgetType(null);
                setDraggedElementId("");
                setDropTarget(null);
              }}
              onDragStart={setDraggedWidgetType}
            />
          ) : (
            <LayersPanel
              elements={document?.elements ?? []}
              selectedElement={selectedElement}
              selectedId={selectedId}
              onDeleteSelected={() => deleteElement(selectedId)}
              onSelect={setSelectedId}
              onUpdateSelected={updateSelectedElement}
            />
          )}
        </aside>

        <section className="min-w-0 overflow-hidden bg-background">
          {error ? (
            <p className="absolute left-1/2 top-16 z-30 -translate-x-1/2 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive shadow-sm">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <div className="grid h-full place-items-center">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading block editor
              </p>
            </div>
          ) : null}

          {!isLoading && document ? (
            <div className="grid h-full min-h-0 place-items-start overflow-auto bg-[#d8d4ce]">
              <div
                className={`lx-preview lx-preview-${viewport} min-h-full bg-background shadow-sm ${
                  viewport === "desktop"
                    ? "w-full"
                    : "mx-auto my-5 max-w-full border-x border-black/10"
                }`}
                style={{ width: activeViewport.width, maxWidth: "100%" }}
              >
                <div className="min-h-full">
                  {document.elements.length === 0 ? (
                    <div
                      className={`grid min-h-[calc(100vh-3rem)] place-items-center p-6 transition-colors ${
                        isDropTargetActive(dropTarget, null, 0)
                          ? "bg-primary/10"
                          : draggedWidgetType
                            ? "bg-primary/5"
                            : ""
                      }`}
                      onDragLeave={() => setDropTarget(null)}
                      onDragOver={(event) => {
                        event.preventDefault();
                        setDropTarget({ parentId: null, index: 0 });
                      }}
                      onDrop={(event) =>
                        handleDropAtIndex(event, { parentId: null, index: 0 })
                      }
                    >
                      <div className="rounded-lg border border-dashed border-border bg-card px-6 py-10 text-center">
                        <LayoutGrid className="mx-auto size-8 text-muted-foreground" />
                        <h2 className="mt-4 text-xl font-semibold">Build this block</h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Add widgets from the Elements panel.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      {document.elements.map((element, index) => (
                        <Fragment key={element.id}>
                          <DropZone
                            active={isDropTargetActive(dropTarget, null, index)}
                            index={index}
                            onDragOver={(event) => {
                              event.preventDefault();
                              setDropTarget({ parentId: null, index });
                            }}
                            onDrop={(event) =>
                              handleDropAtIndex(event, { parentId: null, index })
                            }
                          />
                          <EditorElementFrame
                            draggedElementId={draggedElementId}
                            dropTarget={dropTarget}
                            element={element}
                            nested={false}
                            selectedId={selectedId}
                            onDelete={deleteElement}
                            onDropAtIndex={handleDropAtIndex}
                            onDragEnd={() => {
                              setDraggedElementId("");
                              setDropTarget(null);
                            }}
                            onDragStart={setDraggedElementId}
                            onSetDropTarget={setDropTarget}
                            onSelect={(id) => {
                              setSelectedId(id);
                              setPanelMode("layers");
                            }}
                          />
                        </Fragment>
                      ))}
                      <DropZone
                        active={isDropTargetActive(dropTarget, null, document.elements.length)}
                        index={document.elements.length}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDropTarget({ parentId: null, index: document.elements.length });
                        }}
                        onDrop={(event) =>
                          handleDropAtIndex(event, {
                            parentId: null,
                            index: document.elements.length,
                          })
                        }
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

// ── BlockElementsPanel ────────────────────────────────────────────────────────

function BlockElementsPanel({
  onAddSection,
  onDragEnd,
  onDragStart,
}: {
  onAddSection: (type: LyrixElementType) => void;
  onDragEnd: () => void;
  onDragStart: (type: LyrixElementType) => void;
}) {
  const [search, setSearch] = useState("");

  const filteredWidgetGroups = search
    ? widgetGroups
        .map((group) => ({
          ...group,
          widgets: group.widgets.filter((w) =>
            w.label.toLowerCase().includes(search.toLowerCase())
          ),
        }))
        .filter((group) => group.widgets.length > 0)
    : widgetGroups;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelTitle title="Elements" />
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-9 w-full border border-border bg-background pl-9 pr-3 text-xs italic outline-none focus-visible:border-primary"
            placeholder="Search Widget..."
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>

        <div className="mt-4 grid gap-5">
          {filteredWidgetGroups.map((group) => (
            <section key={group.title}>
              <h2 className="text-sm font-semibold">{group.title}</h2>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {group.widgets.map((widget) => (
                  <button
                    key={widget.label}
                    type="button"
                    draggable={Boolean(widget.type)}
                    disabled={!widget.type}
                    onDragEnd={onDragEnd}
                    onDragStart={(event) => {
                      if (!widget.type) return;
                      event.dataTransfer.effectAllowed = "copy";
                      event.dataTransfer.setData("application/x-lyrix-widget", widget.type);
                      onDragStart(widget.type);
                    }}
                    onClick={() => { if (widget.type) onAddSection(widget.type); }}
                    className="flex min-h-20 flex-col items-center justify-center gap-2 border border-border bg-background p-3 text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <widget.icon className="size-7" />
                    {widget.label}
                  </button>
                ))}
              </div>
            </section>
          ))}

          {filteredWidgetGroups.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground">
              No widgets match your search.
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}
