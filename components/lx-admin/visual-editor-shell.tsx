"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  CircleHelp,
  Columns2,
  Eye,
  GripVertical,
  Heading1,
  Image as ImageIcon,
  Layers3,
  LayoutGrid,
  Loader2,
  Monitor,
  MousePointerClick,
  Plus,
  Save,
  Search,
  SeparatorHorizontal,
  Settings2,
  SlidersHorizontal,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import { LyrixElementView } from "@/components/lyrix/lyrix-renderer";
import {
  createElementFromTemplate,
  isLyrixPageDocument,
  LyrixElement,
  LyrixElementType,
  LyrixPageDocument,
  LyrixSpacing,
} from "@/lib/lyrix-document";

type VisualEditorShellProps = {
  pagePath: string;
};

type Viewport = "desktop" | "tablet" | "mobile";
type SaveState = "idle" | "saving" | "saved" | "error";
type PanelMode = "elements" | "settings" | "layers";
type InspectorTab = "content" | "style" | "advanced";
type DropTarget = {
  parentId: string | null;
  index: number;
};
type ElementLocation = DropTarget & {
  element: LyrixElement;
};

const viewportOptions: Array<{
  key: Viewport;
  label: string;
  icon: React.ElementType;
  widthClass: string;
}> = [
  { key: "desktop", label: "Desktop", icon: Monitor, widthClass: "max-w-6xl" },
  { key: "tablet", label: "Tablet", icon: Tablet, widthClass: "max-w-3xl" },
  { key: "mobile", label: "Mobile", icon: Smartphone, widthClass: "max-w-sm" },
];

const widgetGroups: Array<{
  title: string;
  widgets: Array<{
    label: string;
    icon: React.ElementType;
    type?: LyrixElementType;
  }>;
}> = [
  {
    title: "Layout",
    widgets: [
      { label: "Container", icon: Columns2, type: "container" },
      { label: "Spacer", icon: SeparatorHorizontal, type: "spacer" },
      { label: "Section", icon: LayoutGrid, type: "hero" },
    ],
  },
  {
    title: "Basic",
    widgets: [
      { label: "Heading", icon: Heading1, type: "heading" },
      { label: "Image", icon: ImageIcon, type: "image" },
      { label: "Text Editor", icon: Type, type: "text" },
      { label: "Video", icon: Video },
      { label: "Button", icon: MousePointerClick, type: "button" },
      { label: "Divider", icon: SeparatorHorizontal, type: "divider" },
    ],
  },
  {
    title: "Lyrix",
    widgets: [
      { label: "Hero", icon: Heading1, type: "hero" },
      { label: "Features", icon: LayoutGrid, type: "feature-grid" },
      { label: "Call To Action", icon: MousePointerClick, type: "cta" },
    ],
  },
];

export function VisualEditorShell({ pagePath }: VisualEditorShellProps) {
  const [document, setDocument] = useState<LyrixPageDocument | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [viewport, setViewport] = useState<Viewport>("desktop");
  const [panelMode, setPanelMode] = useState<PanelMode>("elements");
  const [draggedWidgetType, setDraggedWidgetType] =
    useState<LyrixElementType | null>(null);
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
  const viewportWidth =
    viewportOptions.find((option) => option.key === viewport)?.widthClass ??
    "max-w-6xl";

  useEffect(() => {
    let isActive = true;

    async function loadDocument() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(
          `/api/lx-admin/page-document?path=${encodeURIComponent(pagePath)}`
        );
        const payload = await response.json().catch(() => ({}));

        if (!response.ok) {
          throw new Error(payload.error || "Could not load the page.");
        }

        if (!isLyrixPageDocument(payload.document)) {
          throw new Error("The page document was invalid.");
        }

        if (!isActive) {
          return;
        }

        setDocument(payload.document);
        setSelectedId(payload.document.elements[0]?.id ?? "");
      } catch (loadError) {
        if (isActive) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Could not load the page."
          );
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    }

    loadDocument();

    return () => {
      isActive = false;
    };
  }, [pagePath]);

  function addSection(type: LyrixElementType) {
    insertElement(type, {
      parentId: null,
      index: document?.elements.length ?? 0,
    });
  }

  function insertElement(type: LyrixElementType, target: DropTarget) {
    const element = createElementFromTemplate(type);

    setDocument((currentDocument) => {
      if (!currentDocument) {
        return currentDocument;
      }

      return {
        ...currentDocument,
        elements: insertElementAtTarget(currentDocument.elements, target, element),
      };
    });
    setSelectedId(element.id);
    setPanelMode("layers");
    setDropTarget(null);
    setDraggedWidgetType(null);
    setSaveState("idle");
  }

  function handleDropAtIndex(
    event: React.DragEvent<HTMLElement>,
    target: DropTarget
  ) {
    event.preventDefault();
    event.stopPropagation();

    const elementId = event.dataTransfer.getData("application/x-lyrix-element");

    if (elementId) {
      moveElement(elementId, target);
      return;
    }

    const type =
      (event.dataTransfer.getData(
        "application/x-lyrix-widget"
      ) as LyrixElementType) || draggedWidgetType;

    if (isLyrixElementType(type)) {
      insertElement(type, target);
    }

    setDropTarget(null);
    setDraggedWidgetType(null);
  }

  function moveElement(elementId: string, target: DropTarget) {
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return currentDocument;
      }

      const source = findElementLocation(currentDocument.elements, elementId);

      if (!source || isDescendantOf(source.element, target.parentId)) {
        return currentDocument;
      }

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
        return currentDocument;
      }

      const withoutElement = deleteElementById(currentDocument.elements, elementId);

      return {
        ...currentDocument,
        elements: insertElementAtTarget(
          withoutElement,
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
    setDocument((currentDocument) => {
      if (!currentDocument) {
        return currentDocument;
      }

      return {
        ...currentDocument,
        elements: updateElementById(currentDocument.elements, selectedId, props),
      };
    });
    setSaveState("idle");
  }

  function deleteElement(elementId: string) {
    if (!elementId) {
      return;
    }

    setDocument((currentDocument) => {
      if (!currentDocument) {
        return currentDocument;
      }

      const nextElements = deleteElementById(currentDocument.elements, elementId);

      setSelectedId(findFirstElement(nextElements)?.id ?? "");

      return {
        ...currentDocument,
        elements: nextElements,
      };
    });
    setSaveState("idle");
  }

  function deleteSelectedElement() {
    deleteElement(selectedId);
  }

  async function saveDocument() {
    if (!document || saveState === "saving") {
      return;
    }

    setSaveState("saving");
    setError("");

    try {
      const response = await fetch("/api/lx-admin/page-document", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          path: pagePath,
          document,
        }),
      });
      const payload = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(payload.error || "Could not save this page.");
      }

      if (!isLyrixPageDocument(payload.document)) {
        throw new Error("The saved page document was invalid.");
      }

      setDocument(payload.document);
      setSaveState("saved");
    } catch (saveError) {
      setSaveState("error");
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Could not save this page."
      );
    }
  }

  return (
    <main className="h-screen overflow-hidden bg-[#d8d4ce] text-foreground">
      <header className="grid h-12 grid-cols-[auto_minmax(0,1fr)_auto] border-b border-black/60 bg-[#050606] text-white">
        <div className="flex items-center border-r border-white/15">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex h-12 w-12 items-center justify-center border-r border-white/10 transition-colors hover:bg-white/10"
              aria-label="Lyrix menu"
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
                  Exit the Editor
                </Link>
                <Link
                  className="block rounded-md px-3 py-2 text-sm font-medium hover:bg-muted"
                  href={pagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setIsMenuOpen(false)}
                >
                  View Page
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
            active={panelMode === "settings"}
            label="Site Settings"
            onClick={() => setPanelMode("settings")}
          >
            <SlidersHorizontal className="size-5" />
          </TopbarIcon>
          <TopbarIcon
            active={panelMode === "layers"}
            label="Layers"
            onClick={() => setPanelMode("layers")}
          >
            <Layers3 className="size-5" />
          </TopbarIcon>
        </div>

        <div className="flex min-w-0 items-center justify-center">
          <div className="hidden h-12 items-center border-x border-white/15 px-5 text-sm font-medium sm:flex">
            <span className="truncate">Explore</span>
            <span className="ml-1 text-white/60">(Draft)</span>
          </div>
          <div className="flex h-12 items-center border-r border-white/15 px-3">
            <Settings2 className="size-4 text-white/75" />
          </div>
          <div className="flex h-12 items-center gap-1 border-r border-white/15 px-3">
            {viewportOptions.map((option) => (
              <button
                key={option.key}
                type="button"
                onClick={() => setViewport(option.key)}
                className={`flex size-9 items-center justify-center border-b-2 transition-colors ${
                  viewport === option.key
                    ? "border-white text-white"
                    : "border-transparent text-white/65 hover:text-white"
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
          <TopbarIcon label="Search">
            <Search className="size-5" />
          </TopbarIcon>
          <TopbarIcon label="Help">
            <CircleHelp className="size-5" />
          </TopbarIcon>
          <TopbarLink href={pagePath} label="Preview">
            <Eye className="size-5" />
          </TopbarLink>
          <button
            disabled={!document || saveState === "saving"}
            type="button"
            onClick={saveDocument}
            className="flex h-12 items-center gap-2 bg-primary px-5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
          >
            {saveState === "saving" ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}
            {saveState === "saved" ? "Saved" : "Publish"}
          </button>
        </div>
      </header>

      <div className="grid h-[calc(100vh-3rem)] grid-cols-[280px_minmax(0,1fr)]">
        <aside className="min-h-0 border-r border-black/20 bg-white">
          <EditorPanel
            document={document}
            mode={panelMode}
            selectedElement={selectedElement}
            selectedId={selectedId}
            onAddSection={addSection}
            onDeleteSelected={deleteSelectedElement}
            onDragEnd={() => {
              setDraggedWidgetType(null);
              setDraggedElementId("");
              setDropTarget(null);
            }}
            onDragStart={setDraggedWidgetType}
            onSelect={setSelectedId}
            onUpdateSelected={updateSelectedElement}
          />
        </aside>

        <section className="min-w-0 overflow-auto p-6">
          {error ? (
            <p className="mb-3 rounded-lg border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          ) : null}

          {isLoading ? (
            <div className="grid h-full place-items-center">
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Loader2 className="size-4 animate-spin" />
                Loading editor
              </p>
            </div>
          ) : null}

          {!isLoading && document ? (
            <div className={`mx-auto min-h-full ${viewportWidth}`}>
              <div className="overflow-hidden border border-dashed border-white bg-background shadow-sm">
                <div className="min-h-[680px]">
                  {document.elements.length === 0 ? (
                    <div
                      className={`grid min-h-[680px] place-items-center p-6 transition-colors ${
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
                        <h2 className="mt-4 text-xl font-semibold">
                          Start with a section
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                          Pick one from the Elements panel.
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
                        active={isDropTargetActive(
                          dropTarget,
                          null,
                          document.elements.length
                        )}
                        index={document.elements.length}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setDropTarget({
                            parentId: null,
                            index: document.elements.length,
                          });
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

function isLyrixElementType(value: unknown): value is LyrixElementType {
  return (
    value === "container" ||
    value === "hero" ||
    value === "heading" ||
    value === "button" ||
    value === "image" ||
    value === "divider" ||
    value === "spacer" ||
    value === "text" ||
    value === "feature-grid" ||
    value === "cta"
  );
}

function EditorElementFrame({
  draggedElementId,
  dropTarget,
  element,
  nested = false,
  selectedId,
  onDelete,
  onDragEnd,
  onDragStart,
  onDropAtIndex,
  onSelect,
  onSetDropTarget,
}: {
  draggedElementId: string;
  dropTarget: DropTarget | null;
  element: LyrixElement;
  nested?: boolean;
  selectedId: string;
  onDelete: (id: string) => void;
  onDragEnd: () => void;
  onDragStart: (id: string) => void;
  onDropAtIndex: (
    event: React.DragEvent<HTMLElement>,
    target: DropTarget
  ) => void;
  onSelect: (id: string) => void;
  onSetDropTarget: (target: DropTarget | null) => void;
}) {
  const isSelected = selectedId === element.id;
  const isDragging = draggedElementId === element.id;
  const frameActions = (
    <div
      className={`absolute left-1/2 top-0 z-20 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 rounded-full border border-primary bg-background px-1 py-0.5 shadow-sm transition-opacity ${
        isSelected ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
    >
      <span
        className="grid size-7 cursor-grab place-items-center rounded-full text-primary active:cursor-grabbing"
        aria-hidden
      >
        <GripVertical className="size-4" />
      </span>
      <button
        type="button"
        aria-label={`Delete ${element.props.title}`}
        className="grid size-7 place-items-center rounded-full text-destructive transition-colors hover:bg-destructive/10"
        onClick={(event) => {
          event.stopPropagation();
          onDelete(element.id);
        }}
        onDragStart={(event) => event.preventDefault()}
      >
        <Trash2 className="size-4" />
      </button>
    </div>
  );
  const dragHandlers = {
    draggable: true,
    onDragStart: (event: React.DragEvent<HTMLElement>) => {
      event.stopPropagation();
      event.dataTransfer.effectAllowed = "move";
      event.dataTransfer.setData("application/x-lyrix-element", element.id);
      onDragStart(element.id);
      onSelect(element.id);
    },
    onDragEnd: (event: React.DragEvent<HTMLElement>) => {
      event.stopPropagation();
      onDragEnd();
    },
  };

  if (element.type === "container") {
    const children = element.children ?? [];

    return (
      <section
        {...dragHandlers}
        role="button"
        tabIndex={0}
        onClick={(event) => {
          event.stopPropagation();
          onSelect(element.id);
        }}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            onSelect(element.id);
          }
        }}
        className={`relative ${nested ? "py-1" : "container-layout py-3"} outline-none transition-shadow ${
          isSelected
            ? "ring-2 ring-primary ring-offset-2 ring-offset-[#d8d4ce]"
            : "hover:ring-1 hover:ring-white"
        } ${isDragging ? "opacity-45" : ""}`}
      >
        {frameActions}
        <div>
          {children.length === 0 ? (
            <div
              className={`grid min-h-16 place-items-center transition-colors ${
                isDropTargetActive(dropTarget, element.id, 0)
                  ? "bg-primary/10"
                  : "bg-transparent"
              }`}
              onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSetDropTarget({ parentId: element.id, index: 0 });
              }}
              onDrop={(event) =>
                onDropAtIndex(event, { parentId: element.id, index: 0 })
              }
            >
              {isDropTargetActive(dropTarget, element.id, 0) ? (
                <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
                  Drop widget here
                </span>
              ) : null}
            </div>
          ) : (
            children.map((child, index) => (
              <Fragment key={child.id}>
                <DropZone
                  active={isDropTargetActive(dropTarget, element.id, index)}
                  index={index}
                  onDragOver={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    onSetDropTarget({ parentId: element.id, index });
                  }}
                  onDrop={(event) =>
                    onDropAtIndex(event, { parentId: element.id, index })
                  }
                />
                <EditorElementFrame
                  draggedElementId={draggedElementId}
                  dropTarget={dropTarget}
                  element={child}
                  nested
                  selectedId={selectedId}
                  onDelete={onDelete}
                  onDragEnd={onDragEnd}
                  onDragStart={onDragStart}
                  onDropAtIndex={onDropAtIndex}
                  onSelect={onSelect}
                  onSetDropTarget={onSetDropTarget}
                />
              </Fragment>
            ))
          )}

          {children.length > 0 ? (
            <DropZone
              active={isDropTargetActive(dropTarget, element.id, children.length)}
              index={children.length}
              onDragOver={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onSetDropTarget({
                  parentId: element.id,
                  index: children.length,
                });
              }}
              onDrop={(event) =>
                onDropAtIndex(event, {
                  parentId: element.id,
                  index: children.length,
                })
              }
            />
          ) : null}
        </div>
      </section>
    );
  }

  return (
    <div
      {...dragHandlers}
      role="button"
      tabIndex={0}
      onClick={(event) => {
        event.stopPropagation();
        onSelect(element.id);
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          onSelect(element.id);
        }
      }}
      className={`relative outline-none transition-shadow ${
        isSelected
          ? "ring-2 ring-primary ring-offset-2 ring-offset-[#d8d4ce]"
          : "hover:ring-1 hover:ring-white"
      } ${isDragging ? "opacity-45" : ""}`}
    >
      {frameActions}
      <LyrixElementView element={element} nested={nested} />
    </div>
  );
}

function isDropTargetActive(
  dropTarget: DropTarget | null,
  parentId: string | null,
  index: number
) {
  return dropTarget?.parentId === parentId && dropTarget.index === index;
}

function findElementById(elements: LyrixElement[], id: string): LyrixElement | undefined {
  for (const element of elements) {
    if (element.id === id) {
      return element;
    }

    const child = findElementById(element.children ?? [], id);

    if (child) {
      return child;
    }
  }
}

function findElementLocation(
  elements: LyrixElement[],
  id: string,
  parentId: string | null = null
): ElementLocation | undefined {
  for (let index = 0; index < elements.length; index += 1) {
    const element = elements[index];

    if (element.id === id) {
      return {
        element,
        parentId,
        index,
      };
    }

    const child = findElementLocation(element.children ?? [], id, element.id);

    if (child) {
      return child;
    }
  }
}

function isDescendantOf(element: LyrixElement, maybeDescendantId: string | null) {
  if (!maybeDescendantId) {
    return false;
  }

  return Boolean(findElementById(element.children ?? [], maybeDescendantId));
}

function findFirstElement(elements: LyrixElement[]): LyrixElement | undefined {
  for (const element of elements) {
    return element;
  }
}

function insertElementAtTarget(
  elements: LyrixElement[],
  target: DropTarget,
  element: LyrixElement
): LyrixElement[] {
  if (!target.parentId) {
    const nextElements = [...elements];
    const safeIndex = Math.max(0, Math.min(target.index, nextElements.length));

    nextElements.splice(safeIndex, 0, element);

    return nextElements;
  }

  return elements.map((candidate) => {
    if (candidate.id === target.parentId) {
      const children = [...(candidate.children ?? [])];
      const safeIndex = Math.max(0, Math.min(target.index, children.length));

      children.splice(safeIndex, 0, element);

      return {
        ...candidate,
        children,
      };
    }

    if (candidate.children?.length) {
      return {
        ...candidate,
        children: insertElementAtTarget(candidate.children, target, element),
      };
    }

    return candidate;
  });
}

function updateElementById(
  elements: LyrixElement[],
  id: string,
  props: Partial<LyrixElement["props"]>
): LyrixElement[] {
  return elements.map((element) => {
    if (element.id === id) {
      return {
        ...element,
        props: {
          ...element.props,
          ...props,
        },
      };
    }

    if (element.children?.length) {
      return {
        ...element,
        children: updateElementById(element.children, id, props),
      };
    }

    return element;
  });
}

function deleteElementById(elements: LyrixElement[], id: string): LyrixElement[] {
  return elements
    .filter((element) => element.id !== id)
    .map((element) => {
      if (!element.children?.length) {
        return element;
      }

      return {
        ...element,
        children: deleteElementById(element.children, id),
      };
    });
}

function flattenElements(
  elements: LyrixElement[],
  depth = 0
): Array<{ element: LyrixElement; depth: number }> {
  return elements.flatMap((element) => [
    { element, depth },
    ...flattenElements(element.children ?? [], depth + 1),
  ]);
}

function DropZone({
  active,
  index,
  onDragOver,
  onDrop,
}: {
  active: boolean;
  index: number;
  onDragOver: (event: React.DragEvent<HTMLDivElement>) => void;
  onDrop: (event: React.DragEvent<HTMLDivElement>) => void;
}) {
  return (
    <div
      className={`group relative flex h-4 items-center transition-all ${
        active ? "h-12 bg-primary/10" : ""
      }`}
      data-drop-index={index}
      onDragLeave={(event) => {
        if (event.currentTarget.contains(event.relatedTarget as Node)) {
          return;
        }
      }}
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div
        className={`mx-5 h-0.5 flex-1 rounded-full transition-colors ${
          active ? "bg-primary" : "bg-transparent group-hover:bg-primary/30"
        }`}
      />
      {active ? (
        <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
          Drop here
        </span>
      ) : null}
    </div>
  );
}

function EditorPanel({
  document,
  mode,
  selectedElement,
  selectedId,
  onAddSection,
  onDeleteSelected,
  onDragEnd,
  onDragStart,
  onSelect,
  onUpdateSelected,
}: {
  document: LyrixPageDocument | null;
  mode: PanelMode;
  selectedElement: LyrixElement | undefined;
  selectedId: string;
  onAddSection: (type: LyrixElementType) => void;
  onDeleteSelected: () => void;
  onDragEnd: () => void;
  onDragStart: (type: LyrixElementType) => void;
  onSelect: (id: string) => void;
  onUpdateSelected: (props: Partial<LyrixElement["props"]>) => void;
}) {
  if (mode === "settings") {
    return <SiteSettingsPanel document={document} />;
  }

  if (mode === "layers") {
    return (
      <LayersPanel
        document={document}
        selectedElement={selectedElement}
        selectedId={selectedId}
        onDeleteSelected={onDeleteSelected}
        onSelect={onSelect}
        onUpdateSelected={onUpdateSelected}
      />
    );
  }

  return (
    <ElementsPanel
      onAddSection={onAddSection}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    />
  );
}

function ElementsPanel({
  onAddSection,
  onDragEnd,
  onDragStart,
}: {
  onAddSection: (type: LyrixElementType) => void;
  onDragEnd: () => void;
  onDragStart: (type: LyrixElementType) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelTitle title="Elements" />
      <div className="grid grid-cols-2 border-b border-border text-xs">
        <button className="border-b-2 border-black py-3 font-medium" type="button">
          Widgets
        </button>
        <button className="py-3 text-muted-foreground" type="button">
          Globals
        </button>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <label className="relative block">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <input
            className="h-9 w-full border border-border bg-background pl-9 pr-3 text-xs italic outline-none focus-visible:border-primary"
            placeholder="Search Widget..."
            type="search"
          />
        </label>
        <div className="mt-4 grid gap-5">
          {widgetGroups.map((group) => (
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
                      if (!widget.type) {
                        return;
                      }

                      event.dataTransfer.effectAllowed = "copy";
                      event.dataTransfer.setData(
                        "application/x-lyrix-widget",
                        widget.type
                      );
                      onDragStart(widget.type);
                    }}
                    onClick={() => {
                      if (widget.type) {
                        onAddSection(widget.type);
                      }
                    }}
                    className="flex min-h-20 flex-col items-center justify-center gap-2 border border-border bg-background p-3 text-center text-xs text-muted-foreground transition-colors hover:border-primary hover:text-foreground disabled:cursor-not-allowed disabled:opacity-45"
                  >
                    <widget.icon className="size-7" />
                    {widget.label}
                  </button>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

function SiteSettingsPanel({
  document,
}: {
  document: LyrixPageDocument | null;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelTitle title="Site Settings" />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="grid gap-3">
          <SettingsRow label="Page" value={document?.title ?? "Loading"} />
          <SettingsRow label="Path" value={document?.path ?? "/"} />
          <SettingsRow label="Status" value="Draft" />
          <SettingsRow label="Canvas" value="Responsive" />
        </div>
      </div>
    </div>
  );
}

function LayersPanel({
  document,
  selectedElement,
  selectedId,
  onDeleteSelected,
  onSelect,
  onUpdateSelected,
}: {
  document: LyrixPageDocument | null;
  selectedElement: LyrixElement | undefined;
  selectedId: string;
  onDeleteSelected: () => void;
  onSelect: (id: string) => void;
  onUpdateSelected: (props: Partial<LyrixElement["props"]>) => void;
}) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <PanelTitle title="Layers" />
      <div className="min-h-0 flex-1 overflow-auto p-4">
        <div className="grid gap-2">
          {flattenElements(document?.elements ?? []).map(({ element, depth }, index) => (
            <button
              key={element.id}
              type="button"
              onClick={() => onSelect(element.id)}
              className={`grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2 border p-2 text-left transition-colors ${
                selectedId === element.id
                  ? "border-primary/20 bg-primary/10"
                  : "border-border bg-background hover:bg-muted"
              }`}
              style={{ paddingLeft: `${8 + depth * 16}px` }}
            >
              <GripVertical className="size-4 text-muted-foreground" />
              <span className="min-w-0">
                <span className="block truncate text-sm font-medium">
                  {index + 1}. {element.props.title}
                </span>
                <span className="block font-mono text-[11px] uppercase text-muted-foreground">
                  {element.type}
                </span>
              </span>
            </button>
          ))}
        </div>

        {selectedElement ? (
          <section className="mt-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Edit
              </h2>
              <button
                type="button"
                onClick={onDeleteSelected}
                className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                aria-label="Delete selected section"
              >
                <Trash2 className="size-4" />
              </button>
            </div>
            <Inspector element={selectedElement} onChange={onUpdateSelected} />
          </section>
        ) : null}
      </div>
    </div>
  );
}

function Inspector({
  element,
  onChange,
}: {
  element: LyrixElement;
  onChange: (props: Partial<LyrixElement["props"]>) => void;
}) {
  const [activeTab, setActiveTab] = useState<InspectorTab>("content");

  return (
    <div className="mt-2">
      <div className="grid grid-cols-3 border border-border bg-background text-xs">
        <InspectorTabButton
          active={activeTab === "content"}
          label="Content"
          onClick={() => setActiveTab("content")}
        />
        <InspectorTabButton
          active={activeTab === "style"}
          label="Style"
          onClick={() => setActiveTab("style")}
        />
        <InspectorTabButton
          active={activeTab === "advanced"}
          label="Advanced"
          onClick={() => setActiveTab("advanced")}
        />
      </div>

      <div className="mt-4">
        {activeTab === "content" ? (
          <ContentInspector element={element} onChange={onChange} />
        ) : null}
        {activeTab === "style" ? (
          <StyleInspector element={element} onChange={onChange} />
        ) : null}
        {activeTab === "advanced" ? (
          <AdvancedInspector element={element} onChange={onChange} />
        ) : null}
      </div>
    </div>
  );
}

function ContentInspector({
  element,
  onChange,
}: {
  element: LyrixElement;
  onChange: (props: Partial<LyrixElement["props"]>) => void;
}) {
  if (element.type === "container") {
    return (
      <div className="grid gap-3">
        <EditorField
          label="Container name"
          value={element.props.title}
          onChange={(value) => onChange({ title: value })}
        />
        <div className="border border-border bg-background p-3 text-sm text-muted-foreground">
          {element.children?.length ?? 0} child widget
          {(element.children?.length ?? 0) === 1 ? "" : "s"} inside. Drag
          widgets from Elements into this container.
        </div>
      </div>
    );
  }

  if (element.type === "button") {
    return (
      <div className="grid gap-3">
        <EditorField
          label="Button label"
          value={element.props.buttonLabel ?? ""}
          onChange={(value) => onChange({ buttonLabel: value, title: value })}
        />
        <EditorField
          label="Button link"
          value={element.props.buttonHref ?? ""}
          onChange={(value) => onChange({ buttonHref: value })}
        />
      </div>
    );
  }

  if (element.type === "image") {
    return (
      <div className="grid gap-3">
        <EditorField
          label="Image source"
          value={element.props.imageSrc ?? ""}
          onChange={(value) => onChange({ imageSrc: value })}
        />
        <EditorField
          label="Alt text"
          value={element.props.imageAlt ?? ""}
          onChange={(value) => onChange({ imageAlt: value })}
        />
        <EditorField
          label="Height"
          value={element.props.height ?? ""}
          onChange={(value) => onChange({ height: value })}
        />
      </div>
    );
  }

  if (element.type === "spacer") {
    return (
      <div className="grid gap-3">
        <EditorField
          label="Height"
          value={element.props.height ?? ""}
          onChange={(value) => onChange({ height: value })}
        />
      </div>
    );
  }

  if (element.type === "divider") {
    return (
      <div className="border border-border bg-background p-3 text-sm text-muted-foreground">
        Divider only uses Style and Advanced controls for now.
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      <EditorField
        label="Eyebrow"
        value={element.props.eyebrow ?? ""}
        onChange={(value) => onChange({ eyebrow: value })}
      />
      <EditorField
        label="Title"
        value={element.props.title}
        onChange={(value) => onChange({ title: value })}
      />
      {element.type !== "heading" ? (
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Body</span>
          <textarea
            className="min-h-24 resize-none border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary"
            value={element.props.body ?? ""}
            onChange={(event) => onChange({ body: event.target.value })}
          />
        </label>
      ) : null}
      {element.type === "hero" || element.type === "cta" ? (
        <>
          <EditorField
            label="Button label"
            value={element.props.buttonLabel ?? ""}
            onChange={(value) => onChange({ buttonLabel: value })}
          />
          <EditorField
            label="Button link"
            value={element.props.buttonHref ?? ""}
            onChange={(value) => onChange({ buttonHref: value })}
          />
        </>
      ) : null}
      {element.type === "feature-grid" ? (
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Items</span>
          <textarea
            className="min-h-24 resize-none border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary"
            value={(element.props.items ?? []).join("\n")}
            onChange={(event) =>
              onChange({
                items: event.target.value
                  .split("\n")
                  .map((item) => item.trim())
                  .filter(Boolean),
              })
            }
          />
          <span className="font-mono text-[11px] text-muted-foreground">
            One item per line.
          </span>
        </label>
      ) : null}
    </div>
  );
}

function StyleInspector({
  element,
  onChange,
}: {
  element: LyrixElement;
  onChange: (props: Partial<LyrixElement["props"]>) => void;
}) {
  const style = element.props.style ?? {};

  function updateStyle(nextStyle: Partial<NonNullable<typeof element.props.style>>) {
    onChange({
      style: {
        ...style,
        ...nextStyle,
      },
    });
  }

  return (
    <div className="grid gap-4">
      <InspectorGroup title="Colors">
        <EditorField
          label="Background"
          type="color"
          value={style.backgroundColor || "#ffffff"}
          onChange={(value) => updateStyle({ backgroundColor: value })}
        />
        <EditorField
          label="Text"
          type="color"
          value={style.textColor || "#222222"}
          onChange={(value) => updateStyle({ textColor: value })}
        />
      </InspectorGroup>

      <InspectorGroup title="Border">
        <EditorField
          label="Border color"
          type="color"
          value={style.borderColor || "#e5e0d8"}
          onChange={(value) => updateStyle({ borderColor: value })}
        />
        <EditorField
          label="Border width"
          value={style.borderWidth ?? ""}
          onChange={(value) => updateStyle({ borderWidth: value })}
        />
        <EditorField
          label="Radius"
          value={style.borderRadius ?? ""}
          onChange={(value) => updateStyle({ borderRadius: value })}
        />
      </InspectorGroup>

      <InspectorGroup title="Effects">
        <SelectField
          label="Shadow"
          value={style.boxShadow ?? ""}
          options={[
            { label: "None", value: "" },
            { label: "Soft", value: "0 10px 30px rgb(0 0 0 / 0.08)" },
            { label: "Strong", value: "0 18px 50px rgb(0 0 0 / 0.16)" },
          ]}
          onChange={(value) => updateStyle({ boxShadow: value })}
        />
        <SelectField
          label="Alignment"
          value={style.alignment ?? "left"}
          options={[
            { label: "Left", value: "left" },
            { label: "Center", value: "center" },
            { label: "Right", value: "right" },
          ]}
          onChange={(value) =>
            updateStyle({
              alignment: value as NonNullable<typeof style.alignment>,
            })
          }
        />
      </InspectorGroup>
    </div>
  );
}

function AdvancedInspector({
  element,
  onChange,
}: {
  element: LyrixElement;
  onChange: (props: Partial<LyrixElement["props"]>) => void;
}) {
  const advanced = element.props.advanced ?? {};

  function updateAdvanced(
    nextAdvanced: Partial<NonNullable<typeof element.props.advanced>>
  ) {
    onChange({
      advanced: {
        ...advanced,
        ...nextAdvanced,
      },
    });
  }

  return (
    <div className="grid gap-4">
      <InspectorGroup title="Layout">
        <SpacingControl
          label="Margin"
          value={advanced.margin}
          onChange={(margin) => updateAdvanced({ margin })}
        />
        <SpacingControl
          label="Padding"
          value={advanced.padding}
          onChange={(padding) => updateAdvanced({ padding })}
        />
        <SelectField
          label="Width"
          value={advanced.width ?? "default"}
          options={[
            { label: "Default", value: "default" },
            { label: "Full", value: "100%" },
            { label: "Auto", value: "auto" },
          ]}
          onChange={(value) =>
            updateAdvanced({ width: value === "default" ? "" : value })
          }
        />
        <SelectField
          label="Align Self"
          value={advanced.alignSelf ?? "auto"}
          options={[
            { label: "Auto", value: "auto" },
            { label: "Start", value: "start" },
            { label: "Center", value: "center" },
            { label: "End", value: "end" },
            { label: "Stretch", value: "stretch" },
          ]}
          onChange={(value) =>
            updateAdvanced({
              alignSelf: value as NonNullable<typeof advanced.alignSelf>,
            })
          }
        />
        <EditorField
          label="Order"
          value={advanced.order ?? ""}
          onChange={(value) => updateAdvanced({ order: value })}
        />
        <SelectField
          label="Position"
          value={advanced.position ?? "default"}
          options={[
            { label: "Default", value: "default" },
            { label: "Relative", value: "relative" },
            { label: "Absolute", value: "absolute" },
          ]}
          onChange={(value) =>
            updateAdvanced({
              position: value as NonNullable<typeof advanced.position>,
            })
          }
        />
        <EditorField
          label="Z-Index"
          value={advanced.zIndex ?? ""}
          onChange={(value) => updateAdvanced({ zIndex: value })}
        />
      </InspectorGroup>

      <InspectorGroup title="Attributes">
        <EditorField
          label="CSS ID"
          value={advanced.cssId ?? ""}
          onChange={(value) => updateAdvanced({ cssId: value })}
        />
        <EditorField
          label="CSS Classes"
          value={advanced.cssClasses ?? ""}
          onChange={(value) => updateAdvanced({ cssClasses: value })}
        />
      </InspectorGroup>
    </div>
  );
}

function EditorField({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <input
        className="h-9 border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-primary"
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  );
}

function InspectorTabButton({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`border-b-2 px-2 py-3 font-medium transition-colors ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}

function InspectorGroup({
  children,
  title,
}: {
  children: React.ReactNode;
  title: string;
}) {
  return (
    <section className="grid gap-3 border-b border-border pb-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <select
        className="h-9 border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function SpacingControl({
  label,
  onChange,
  value,
}: {
  label: string;
  onChange: (value: LyrixSpacing) => void;
  value?: LyrixSpacing;
}) {
  const spacing = value ?? {};
  const unit = spacing.unit ?? "px";

  function updateSpacing(nextSpacing: Partial<LyrixSpacing>) {
    onChange({
      ...spacing,
      unit,
      ...nextSpacing,
    });
  }

  return (
    <div className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-medium">{label}</span>
        <select
          className="h-7 border border-border bg-background px-2 text-xs outline-none"
          value={unit}
          onChange={(event) =>
            updateSpacing({ unit: event.target.value as LyrixSpacing["unit"] })
          }
        >
          <option value="px">px</option>
          <option value="%">%</option>
          <option value="rem">rem</option>
        </select>
      </div>
      <div className="grid grid-cols-4">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <label key={side} className="grid gap-1">
            <input
              className="h-8 border border-border bg-background px-2 text-center text-xs outline-none focus-visible:border-primary"
              value={spacing[side] ?? ""}
              onChange={(event) => updateSpacing({ [side]: event.target.value })}
            />
            <span className="text-center text-[10px] capitalize text-muted-foreground">
              {side}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

function PanelTitle({ title }: { title: string }) {
  return (
    <div className="border-b border-border px-4 py-3 text-center">
      <h1 className="text-base font-semibold">{title}</h1>
    </div>
  );
}

function SettingsRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border border-border bg-background p-3">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-semibold">{value}</p>
    </div>
  );
}

function TopbarIcon({
  active = false,
  children,
  label,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-12 w-12 items-center justify-center border-r border-white/10 transition-colors ${
        active ? "bg-white/15 text-white" : "text-white/75 hover:bg-white/10 hover:text-white"
      }`}
      aria-label={label}
      title={label}
    >
      {children}
    </button>
  );
}

function TopbarLink({
  children,
  href,
  label,
}: {
  children: React.ReactNode;
  href: string;
  label: string;
}) {
  return (
    <Link
      aria-label={label}
      className="flex h-12 w-12 items-center justify-center border-r border-white/10 text-white/75 transition-colors hover:bg-white/10 hover:text-white"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      title={label}
    >
      {children}
    </Link>
  );
}
