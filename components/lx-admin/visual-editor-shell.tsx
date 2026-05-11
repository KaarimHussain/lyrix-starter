"use client";

import Link from "next/link";
import NextImage from "next/image";
import { Fragment, useEffect, useMemo, useState } from "react";
import {
  Columns2,
  Eye,
  GripVertical,
  Heading1,
  Image as ImageIcon,
  ListChecks,
  Layers3,
  LayoutGrid,
  Loader2,
  Monitor,
  MousePointerClick,
  Plus,
  Save,
  Search,
  SeparatorHorizontal,
  Smartphone,
  Tablet,
  Trash2,
  Type,
  Video,
} from "lucide-react";
import {
  containerLayoutStyle,
  elementStyle,
  LyrixElementView,
} from "@/components/lyrix/lyrix-renderer";
import {
  createElementFromTemplate,
  isLyrixPageDocument,
  LyrixContainerLayout,
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

type Option = {
  label: string;
  value: string;
};

const viewportOptions: Array<{
  key: Viewport;
  label: string;
  icon: React.ElementType;
  width: string;
}> = [
  { key: "desktop", label: "Desktop", icon: Monitor, width: "100%" },
  { key: "tablet", label: "Tablet", icon: Tablet, width: "768px" },
  { key: "mobile", label: "Mobile", icon: Smartphone, width: "390px" },
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
    ],
  },
  {
    title: "Basic",
    widgets: [
      { label: "Heading", icon: Heading1, type: "heading" },
      { label: "Image", icon: ImageIcon, type: "image" },
      { label: "Text Editor", icon: Type, type: "text" },
      { label: "Video", icon: Video, type: "video" },
      { label: "Icon List", icon: ListChecks, type: "icon-list" },
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

const containerTypeOptions: Option[] = [
  { label: "Flex", value: "flex" },
  { label: "Grid", value: "grid" },
];

const contentWidthOptions: Option[] = [
  { label: "Boxed", value: "boxed" },
  { label: "Full", value: "full" },
];

const flexDirectionOptions: Option[] = [
  { label: "Row", value: "row" },
  { label: "Column", value: "column" },
  { label: "Row Rev", value: "row-reverse" },
  { label: "Col Rev", value: "column-reverse" },
];

const justifyOptions: Option[] = [
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Between", value: "space-between" },
  { label: "Around", value: "space-around" },
  { label: "Evenly", value: "space-evenly" },
];

const alignOptions: Option[] = [
  { label: "Start", value: "flex-start" },
  { label: "Center", value: "center" },
  { label: "End", value: "flex-end" },
  { label: "Stretch", value: "stretch" },
];

const gridAlignOptions: Option[] = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
  { label: "Stretch", value: "stretch" },
];

const gridContentOptions: Option[] = [
  { label: "Start", value: "start" },
  { label: "Center", value: "center" },
  { label: "End", value: "end" },
  { label: "Between", value: "space-between" },
  { label: "Around", value: "space-around" },
  { label: "Evenly", value: "space-evenly" },
];

const wrapOptions: Option[] = [
  { label: "No", value: "nowrap" },
  { label: "Wrap", value: "wrap" },
  { label: "Reverse", value: "wrap-reverse" },
];

const orderModeOptions: Option[] = [
  { label: "Default", value: "default" },
  { label: "Start", value: "start" },
  { label: "End", value: "end" },
  { label: "Custom", value: "custom" },
];

const sizeModeOptions: Option[] = [
  { label: "Default", value: "default" },
  { label: "None", value: "none" },
  { label: "Grow", value: "grow" },
  { label: "Shrink", value: "shrink" },
  { label: "Custom", value: "custom" },
];

const fontSizeOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "Small", value: "14" },
  { label: "Base", value: "16" },
  { label: "Large", value: "20" },
  { label: "XL", value: "24" },
  { label: "2XL", value: "32" },
  { label: "Hero", value: "56" },
];

const fontWeightOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "Regular", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semi Bold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Extra Bold", value: "800" },
];

const lineHeightOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "Tight", value: "1.1" },
  { label: "Normal", value: "1.5" },
  { label: "Relaxed", value: "1.7" },
];

const borderWidthOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "None", value: "0" },
  { label: "Thin", value: "1" },
  { label: "Medium", value: "2" },
  { label: "Thick", value: "4" },
];

const borderRadiusOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "None", value: "0" },
  { label: "Small", value: "4" },
  { label: "Medium", value: "8" },
  { label: "Large", value: "16" },
  { label: "Pill", value: "999" },
];

const opacityOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "100%", value: "100" },
  { label: "75%", value: "75" },
  { label: "50%", value: "50" },
  { label: "25%", value: "25" },
];

const zIndexOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "Low", value: "1" },
  { label: "Medium", value: "10" },
  { label: "High", value: "50" },
  { label: "Top", value: "100" },
];

const letterSpacingOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "Tight", value: "-0.05" },
  { label: "Normal", value: "0" },
  { label: "Wide", value: "0.05" },
  { label: "Wider", value: "0.1" },
];

const textTransformOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "Upper", value: "uppercase" },
  { label: "Lower", value: "lowercase" },
  { label: "Capitalize", value: "capitalize" },
];

const textDecorationOptions: Option[] = [
  { label: "None", value: "none" },
  { label: "Underline", value: "underline" },
  { label: "Strike", value: "line-through" },
];

const fontStyleOptions: Option[] = [
  { label: "Normal", value: "normal" },
  { label: "Italic", value: "italic" },
];

const dividerStyleOptions: Option[] = [
  { label: "Solid", value: "solid" },
  { label: "Dashed", value: "dashed" },
  { label: "Dotted", value: "dotted" },
];

const bulletStyleOptions: Option[] = [
  { label: "Dot", value: "dot" },
  { label: "Check", value: "check" },
  { label: "Dash", value: "dash" },
  { label: "Arrow", value: "arrow" },
];

const backgroundSizeOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "Cover", value: "cover" },
  { label: "Contain", value: "contain" },
  { label: "Auto", value: "auto" },
];

const backgroundPositionOptions: Option[] = [
  { label: "Center", value: "center" },
  { label: "Top", value: "top" },
  { label: "Bottom", value: "bottom" },
  { label: "Left", value: "left" },
  { label: "Right", value: "right" },
];

const backgroundRepeatOptions: Option[] = [
  { label: "No Repeat", value: "no-repeat" },
  { label: "Repeat", value: "repeat" },
  { label: "Repeat X", value: "repeat-x" },
  { label: "Repeat Y", value: "repeat-y" },
];

const filterOptions: Option[] = [
  { label: "None", value: "" },
  { label: "Blur SM", value: "blur(4px)" },
  { label: "Blur", value: "blur(8px)" },
  { label: "Grayscale", value: "grayscale(100%)" },
  { label: "Sepia", value: "sepia(80%)" },
  { label: "Bright+", value: "brightness(1.2)" },
  { label: "Bright-", value: "brightness(0.8)" },
  { label: "Contrast+", value: "contrast(1.2)" },
];

const transitionOptions: Option[] = [
  { label: "None", value: "" },
  { label: "Fast", value: "all 0.15s ease" },
  { label: "Normal", value: "all 0.3s ease" },
  { label: "Slow", value: "all 0.6s ease" },
];

const cursorOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "Pointer", value: "pointer" },
  { label: "Crosshair", value: "crosshair" },
  { label: "Not Allowed", value: "not-allowed" },
  { label: "Grab", value: "grab" },
];

const overflowOptions: Option[] = [
  { label: "Default", value: "" },
  { label: "Hidden", value: "hidden" },
  { label: "Visible", value: "visible" },
  { label: "Scroll", value: "scroll" },
  { label: "Auto", value: "auto" },
];

const blendModeOptions: Option[] = [
  { label: "Normal", value: "" },
  { label: "Multiply", value: "multiply" },
  { label: "Screen", value: "screen" },
  { label: "Overlay", value: "overlay" },
  { label: "Darken", value: "darken" },
  { label: "Lighten", value: "lighten" },
];

const colorSwatches = [
  "#11110f",
  "#ffffff",
  "#2a8f59",
  "#2563eb",
  "#7c3aed",
  "#dc2626",
  "#f59e0b",
  "#e5e0d8",
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
  const activeViewport =
    viewportOptions.find((option) => option.key === viewport) ??
    viewportOptions[0];

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
      <header className="grid h-12 grid-cols-[auto_minmax(0,1fr)_auto] border-b border-primary/70 bg-primary text-primary-foreground">
        <div className="flex items-center border-r border-primary-foreground/15">
          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen((current) => !current)}
              className="flex h-12 w-12 items-center justify-center border-r border-primary-foreground/10 transition-colors hover:bg-primary-foreground/10"
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
            active={panelMode === "layers"}
            label="Layers"
            onClick={() => setPanelMode("layers")}
          >
            <Layers3 className="size-5" />
          </TopbarIcon>
        </div>

        <div className="flex min-w-0 items-center justify-center">
          <div className="flex h-12 items-center gap-1 border-x border-primary-foreground/15 px-3">
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
          <TopbarLink href={pagePath} label="Preview">
            <Eye className="size-5" />
          </TopbarLink>
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
            {saveState === "saved" ? "Saved" : "Publish"}
          </button>
        </div>
      </header>

      <div className="grid h-[calc(100vh-3rem)] grid-cols-[clamp(300px,22vw,340px)_minmax(0,1fr)]">
        <aside className="min-h-0 overflow-hidden border-r border-black/20 bg-[#fbfaf7]">
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
                Loading editor
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
                style={{
                  width: activeViewport.width,
                  maxWidth: "100%",
                }}
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
    value === "video" ||
    value === "icon-list" ||
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
        style={elementStyle(element)}
      >
        {frameActions}
        <div
          className={
            element.props.layout?.containerType === "grid" &&
            element.props.layout.gridOutline !== "hide"
              ? "bg-[linear-gradient(to_right,rgb(15_23_42/.12)_1px,transparent_1px),linear-gradient(to_bottom,rgb(15_23_42/.12)_1px,transparent_1px)] bg-[size:48px_48px]"
              : ""
          }
          style={containerLayoutStyle(element.props.layout)}
        >
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
      <div className="min-h-0 flex-1 overflow-auto p-3">
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
        <div className="grid max-h-44 gap-2 overflow-auto pr-1">
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
          <section className="mt-4">
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
    <div className="mt-2 min-w-0">
      <div className="sticky top-0 z-10 grid grid-cols-3 border border-border bg-[#fbfaf7] text-xs shadow-[0_1px_0_rgb(0_0_0/.04)]">
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

      <div className="mt-4 min-w-0">
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
    const layout = element.props.layout ?? {};

    function updateLayout(nextLayout: Partial<LyrixContainerLayout>) {
      onChange({
        layout: {
          ...layout,
          ...nextLayout,
        },
      });
    }

    const isGrid = layout.containerType === "grid";

    return (
      <div className="grid gap-4">
        <EditorField
          label="Container name"
          placeholder="Name this container"
          value={element.props.title}
          onChange={(value) => onChange({ title: value })}
        />

        <InspectorGroup title="Container">
          <SegmentedControl
            label="Type"
            value={layout.containerType ?? "flex"}
            options={containerTypeOptions}
            onChange={(value) =>
              updateLayout({
                containerType: value as LyrixContainerLayout["containerType"],
              })
            }
          />
        </InspectorGroup>

        {!isGrid ? (
          <InspectorGroup title="Items">
            <SegmentedControl
              label="Direction"
              value={layout.direction ?? "column"}
              options={flexDirectionOptions}
              onChange={(value) =>
                updateLayout({
                  direction: value as LyrixContainerLayout["direction"],
                })
              }
            />
            <SegmentedControl
              label="Justify"
              value={layout.justifyContent ?? "flex-start"}
              options={justifyOptions}
              columns={3}
              onChange={(value) =>
                updateLayout({
                  justifyContent:
                    value as LyrixContainerLayout["justifyContent"],
                })
              }
            />
            <SegmentedControl
              label="Align"
              value={layout.alignItems ?? "stretch"}
              options={alignOptions}
              columns={2}
              onChange={(value) =>
                updateLayout({
                  alignItems: value as LyrixContainerLayout["alignItems"],
                })
              }
            />
            <UnitField
              label="Gap"
              value={layout.gap ?? ""}
              unit={layout.gapUnit ?? "px"}
              units={["px", "%", "vw"]}
              onValueChange={(value) => updateLayout({ gap: value })}
              onUnitChange={(value) =>
                updateLayout({
                  gapUnit: value as LyrixContainerLayout["gapUnit"],
                })
              }
            />
            <SegmentedControl
              label="Wrap"
              value={layout.wrap ?? "nowrap"}
              options={wrapOptions}
              onChange={(value) =>
                updateLayout({ wrap: value as LyrixContainerLayout["wrap"] })
              }
            />
          </InspectorGroup>
        ) : (
          <InspectorGroup title="Grid Items">
            <SegmentedControl
              label="Outline"
              value={layout.gridOutline ?? "show"}
              options={[
                { label: "Show", value: "show" },
                { label: "Hide", value: "hide" },
              ]}
              onChange={(value) =>
                updateLayout({
                  gridOutline: value as LyrixContainerLayout["gridOutline"],
                })
              }
            />
            <CompactFieldGrid>
              <UnitField
                label="Columns"
                help="Use a number, or choose custom for CSS grid values."
                value={layout.columns ?? ""}
                unit={layout.columnUnit ?? "fr"}
                units={["fr", "custom"]}
                onValueChange={(value) => updateLayout({ columns: value })}
                onUnitChange={(value) =>
                  updateLayout({
                    columnUnit: value as LyrixContainerLayout["columnUnit"],
                  })
                }
              />
              <UnitField
                label="Rows"
                help="Use a number, or choose custom for CSS grid values."
                value={layout.rows ?? ""}
                unit={layout.rowUnit ?? "fr"}
                units={["fr", "custom"]}
                onValueChange={(value) => updateLayout({ rows: value })}
                onUnitChange={(value) =>
                  updateLayout({
                    rowUnit: value as LyrixContainerLayout["rowUnit"],
                  })
                }
              />
            </CompactFieldGrid>
            {layout.columnUnit === "custom" ? (
              <EditorField
                label="Column Template"
                placeholder="Example: 1fr 2fr 1fr"
                help="CSS grid-template-columns value."
                value={layout.columnTemplate ?? ""}
                onChange={(value) => updateLayout({ columnTemplate: value })}
              />
            ) : null}
            {layout.rowUnit === "custom" ? (
              <EditorField
                label="Row Template"
                placeholder="Example: auto 1fr"
                help="CSS grid-template-rows value."
                value={layout.rowTemplate ?? ""}
                onChange={(value) => updateLayout({ rowTemplate: value })}
              />
            ) : null}
            <CompactFieldGrid>
              <UnitField
                label="Column Gap"
                value={layout.columnGap ?? ""}
                unit={layout.gridGapUnit ?? "px"}
                units={["px", "%", "rem", "vw"]}
                onValueChange={(value) => updateLayout({ columnGap: value })}
                onUnitChange={(value) =>
                  updateLayout({
                    gridGapUnit: value as LyrixContainerLayout["gridGapUnit"],
                  })
                }
              />
              <EditorField
                label={`Row Gap (${layout.gridGapUnit ?? "px"})`}
                placeholder="20"
                value={layout.rowGap ?? ""}
                onChange={(value) => updateLayout({ rowGap: value })}
              />
            </CompactFieldGrid>
            <SelectField
              label="Auto Flow"
              value={layout.autoFlow ?? "row"}
              options={[
                { label: "Row", value: "row" },
                { label: "Column", value: "column" },
                { label: "Dense", value: "dense" },
                { label: "Row Dense", value: "row dense" },
                { label: "Column Dense", value: "column dense" },
              ]}
              onChange={(value) =>
                updateLayout({
                  autoFlow: value as LyrixContainerLayout["autoFlow"],
                })
              }
            />
            <SegmentedControl
              label="Justify Items"
              value={layout.gridJustifyItems ?? "stretch"}
              options={gridAlignOptions}
              columns={2}
              onChange={(value) =>
                updateLayout({
                  gridJustifyItems:
                    value as LyrixContainerLayout["gridJustifyItems"],
                })
              }
            />
            <SegmentedControl
              label="Align Items"
              value={layout.gridAlignItems ?? "stretch"}
              options={gridAlignOptions}
              columns={2}
              onChange={(value) =>
                updateLayout({
                  gridAlignItems:
                    value as LyrixContainerLayout["gridAlignItems"],
                })
              }
            />
            <SegmentedControl
              label="Justify Content"
              value={layout.gridJustifyContent ?? "start"}
              options={gridContentOptions}
              columns={3}
              onChange={(value) =>
                updateLayout({
                  gridJustifyContent:
                    value as LyrixContainerLayout["gridJustifyContent"],
                })
              }
            />
            <SegmentedControl
              label="Align Content"
              value={layout.gridAlignContent ?? "start"}
              options={gridContentOptions}
              columns={3}
              onChange={(value) =>
                updateLayout({
                  gridAlignContent:
                    value as LyrixContainerLayout["gridAlignContent"],
                })
              }
            />
          </InspectorGroup>
        )}
      </div>
    );
  }

  if (element.type === "button") {
    return (
      <div className="grid gap-3">
        <EditorField
          label="Button label"
          placeholder="Button text"
          value={element.props.buttonLabel ?? ""}
          onChange={(value) => onChange({ buttonLabel: value, title: value })}
        />
        <EditorField
          label="Button link"
          placeholder="/pricing or https://example.com"
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
          placeholder="/window.svg or https://..."
          value={element.props.imageSrc ?? ""}
          onChange={(value) => onChange({ imageSrc: value })}
        />
        <EditorField
          label="Alt text"
          placeholder="Describe the image"
          value={element.props.imageAlt ?? ""}
          onChange={(value) => onChange({ imageAlt: value })}
        />
        <EditorField
          label="Height"
          placeholder="180"
          help="Number in pixels."
          value={element.props.height ?? ""}
          onChange={(value) => onChange({ height: value })}
        />
      </div>
    );
  }

  if (element.type === "video") {
    return (
      <div className="grid gap-3">
        <EditorField
          label="Video URL"
          placeholder="YouTube, Vimeo, or embed URL"
          value={element.props.videoUrl ?? ""}
          onChange={(value) => onChange({ videoUrl: value })}
        />
        <EditorField
          label="Height"
          placeholder="320"
          help="Number in pixels."
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
          placeholder="24"
          help="Number in pixels."
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

  if (element.type === "icon-list") {
    return (
      <label className="grid gap-1.5">
        <span className="text-xs font-medium">List Items</span>
        <textarea
          className="min-h-28 resize-none border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary"
          placeholder={"Fast setup\nResponsive editing\nReusable widgets"}
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
        <span className="text-[11px] leading-4 text-muted-foreground">
          Add one item per line.
        </span>
      </label>
    );
  }

  if (element.type === "text") {
    return (
      <label className="grid gap-1.5">
        <span className="text-xs font-medium">Text</span>
        <textarea
          className="min-h-32 resize-none border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary"
          placeholder="Write your paragraph here."
          value={element.props.body ?? ""}
          onChange={(event) =>
            onChange({ body: event.target.value, title: "Text Editor" })
          }
        />
        <span className="text-[11px] leading-4 text-muted-foreground">
          Plain text with line breaks. Style it from the Style tab.
        </span>
      </label>
    );
  }

  return (
    <div className="grid gap-3">
      <EditorField
        label="Eyebrow"
        placeholder="Small label above the title"
        value={element.props.eyebrow ?? ""}
        onChange={(value) => onChange({ eyebrow: value })}
      />
      <EditorField
        label="Title"
        placeholder="Main heading"
        value={element.props.title}
        onChange={(value) => onChange({ title: value })}
      />
      {element.type !== "heading" ? (
        <label className="grid gap-1.5">
          <span className="text-xs font-medium">Body</span>
          <textarea
            className="min-h-24 resize-none border border-border bg-background px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary"
            placeholder="Write a short paragraph."
            value={element.props.body ?? ""}
            onChange={(event) => onChange({ body: event.target.value })}
          />
        </label>
      ) : null}
      {element.type === "hero" || element.type === "cta" ? (
        <>
          <EditorField
            label="Button label"
            placeholder="Call to action"
            value={element.props.buttonLabel ?? ""}
            onChange={(value) => onChange({ buttonLabel: value })}
          />
          <EditorField
            label="Button link"
            placeholder="/contact or https://..."
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
            placeholder={"Fast rendering\nReusable blocks\nSimple editing"}
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

  if (element.type === "button") {
    return (
      <div className="grid gap-4">
        <InspectorGroup title="Button">
          <EditorField
            label="Button Background"
            type="color"
            value={style.buttonBackgroundColor || style.backgroundColor || "#2a8f59"}
            onChange={(value) => updateStyle({ buttonBackgroundColor: value })}
          />
          <EditorField
            label="Button Text"
            type="color"
            value={style.buttonTextColor || style.textColor || "#ffffff"}
            onChange={(value) => updateStyle({ buttonTextColor: value })}
          />
          <CompactFieldGrid>
            <SelectField
              label="Font Size"
              options={fontSizeOptions}
              value={style.fontSize ?? ""}
              onChange={(value) => updateStyle({ fontSize: value })}
            />
            <SelectField
              label="Weight"
              options={fontWeightOptions}
              value={style.fontWeight ?? ""}
              onChange={(value) => updateStyle({ fontWeight: value })}
            />
          </CompactFieldGrid>
          <CompactFieldGrid>
            <SelectField
              label="Letter Spacing"
              options={letterSpacingOptions}
              value={style.letterSpacing ?? ""}
              onChange={(value) => updateStyle({ letterSpacing: value })}
            />
            <SelectField
              label="Transform"
              options={textTransformOptions}
              value={style.textTransform ?? ""}
              onChange={(value) =>
                updateStyle({
                  textTransform: value as NonNullable<typeof style.textTransform>,
                })
              }
            />
          </CompactFieldGrid>
          <SegmentedControl
            label="Decoration"
            value={style.textDecoration ?? "none"}
            options={textDecorationOptions}
            onChange={(value) =>
              updateStyle({
                textDecoration: value as NonNullable<typeof style.textDecoration>,
              })
            }
          />
          <SegmentedControl
            label="Width"
            value={style.buttonWidth ?? "auto"}
            options={[
              { label: "Auto", value: "auto" },
              { label: "Full Width", value: "full" },
            ]}
            onChange={(value) =>
              updateStyle({
                buttonWidth: value as NonNullable<typeof style.buttonWidth>,
              })
            }
          />
        </InspectorGroup>
        <BorderAndEffectsControls style={style} onChange={updateStyle} />
      </div>
    );
  }

  if (element.type === "image" || element.type === "video") {
    return (
      <div className="grid gap-4">
        <InspectorGroup title={element.type === "image" ? "Image" : "Video"}>
          {element.type === "image" ? (
            <SegmentedControl
              label="Fit"
              value={style.imageFit ?? "contain"}
              options={[
                { label: "Contain", value: "contain" },
                { label: "Cover", value: "cover" },
              ]}
              onChange={(value) =>
                updateStyle({
                  imageFit: value as NonNullable<typeof style.imageFit>,
                })
              }
            />
          ) : null}
          <EditorField
            label="Background"
            type="color"
            value={style.backgroundColor || "#ffffff"}
            onChange={(value) => updateStyle({ backgroundColor: value })}
          />
          <SelectField
            label="Filter"
            options={filterOptions}
            value={style.filter ?? ""}
            onChange={(value) => updateStyle({ filter: value })}
          />
          <SelectField
            label="Blend Mode"
            options={blendModeOptions}
            value={style.mixBlendMode ?? ""}
            onChange={(value) => updateStyle({ mixBlendMode: value })}
          />
        </InspectorGroup>
        <BorderAndEffectsControls style={style} onChange={updateStyle} />
      </div>
    );
  }

  if (element.type === "divider") {
    return (
      <div className="grid gap-4">
        <InspectorGroup title="Divider">
          <EditorField
            label="Color"
            type="color"
            value={style.dividerColor || style.borderColor || "#e5e0d8"}
            onChange={(value) => updateStyle({ dividerColor: value })}
          />
          <CompactFieldGrid>
            <EditorField
              label="Thickness"
              placeholder="2"
              help="Pixels."
              value={style.dividerWidth ?? style.borderWidth ?? ""}
              onChange={(value) => updateStyle({ dividerWidth: value })}
            />
            <SelectField
              label="Style"
              options={dividerStyleOptions}
              value={style.dividerStyle ?? "solid"}
              onChange={(value) =>
                updateStyle({
                  dividerStyle: value as NonNullable<typeof style.dividerStyle>,
                })
              }
            />
          </CompactFieldGrid>
        </InspectorGroup>
      </div>
    );
  }

  if (element.type === "icon-list") {
    return (
      <div className="grid gap-4">
        <InspectorGroup title="List">
          <SegmentedControl
            label="Bullet Style"
            value={style.bulletStyle ?? "dot"}
            options={bulletStyleOptions}
            columns={2}
            onChange={(value) =>
              updateStyle({
                bulletStyle: value as NonNullable<typeof style.bulletStyle>,
              })
            }
          />
          <EditorField
            label="Bullet Color"
            type="color"
            value={style.bulletColor || "#2a8f59"}
            onChange={(value) => updateStyle({ bulletColor: value })}
          />
        </InspectorGroup>
        <InspectorGroup title="Text">
          <EditorField
            label="Text Color"
            type="color"
            value={style.bodyColor || style.textColor || "#444444"}
            onChange={(value) => updateStyle({ bodyColor: value })}
          />
          <CompactFieldGrid>
            <SelectField
              label="Font Size"
              options={fontSizeOptions}
              value={style.bodyFontSize ?? ""}
              onChange={(value) => updateStyle({ bodyFontSize: value })}
            />
            <SelectField
              label="Weight"
              options={fontWeightOptions}
              value={style.bodyWeight ?? style.fontWeight ?? ""}
              onChange={(value) => updateStyle({ bodyWeight: value })}
            />
          </CompactFieldGrid>
          <SelectField
            label="Line Height"
            options={lineHeightOptions}
            value={style.lineHeight ?? ""}
            onChange={(value) => updateStyle({ lineHeight: value })}
          />
        </InspectorGroup>
        <BorderAndEffectsControls style={style} onChange={updateStyle} />
      </div>
    );
  }

  if (element.type === "spacer") {
    return (
      <div className="border border-border bg-background p-3 text-sm text-muted-foreground">
        Spacer visual height is controlled from Content. Use Advanced for spacing,
        position, and custom attributes.
      </div>
    );
  }

  const hasTextControls =
    element.type === "heading" ||
    element.type === "hero" ||
    element.type === "text" ||
    element.type === "feature-grid" ||
    element.type === "cta";
  const hasSurfaceControls =
    element.type === "container" ||
    element.type === "hero" ||
    element.type === "feature-grid" ||
    element.type === "cta";
  const hasButtonControls = element.type === "hero" || element.type === "cta";
  const hasCardControls = element.type === "feature-grid";

  return (
    <div className="grid gap-4">
      {hasTextControls ? (
        <InspectorGroup title="Typography">
          <EditorField
            label="Title Color"
            type="color"
            value={style.titleColor || style.textColor || "#222222"}
            onChange={(value) => updateStyle({ titleColor: value })}
          />
          {element.type !== "heading" ? (
            <EditorField
              label="Body Color"
              type="color"
              value={style.bodyColor || style.textColor || "#666666"}
              onChange={(value) => updateStyle({ bodyColor: value })}
            />
          ) : null}
          <CompactFieldGrid>
            <SelectField
              label="Title Size"
              options={fontSizeOptions}
              value={style.fontSize ?? ""}
              onChange={(value) => updateStyle({ fontSize: value })}
            />
            <SelectField
              label="Weight"
              options={fontWeightOptions}
              value={style.fontWeight ?? ""}
              onChange={(value) => updateStyle({ fontWeight: value })}
            />
          </CompactFieldGrid>
          {element.type !== "heading" ? (
            <CompactFieldGrid>
              <SelectField
                label="Body Size"
                options={fontSizeOptions}
                value={style.bodyFontSize ?? ""}
                onChange={(value) => updateStyle({ bodyFontSize: value })}
              />
              <SelectField
                label="Body Weight"
                options={fontWeightOptions}
                value={style.bodyWeight ?? ""}
                onChange={(value) => updateStyle({ bodyWeight: value })}
              />
            </CompactFieldGrid>
          ) : null}
          <SelectField
            label="Line Height"
            options={lineHeightOptions}
            value={style.lineHeight ?? ""}
            onChange={(value) => updateStyle({ lineHeight: value })}
          />
          <CompactFieldGrid>
            <SelectField
              label="Letter Spacing"
              options={letterSpacingOptions}
              value={style.letterSpacing ?? ""}
              onChange={(value) => updateStyle({ letterSpacing: value })}
            />
            <SelectField
              label="Transform"
              options={textTransformOptions}
              value={style.textTransform ?? ""}
              onChange={(value) =>
                updateStyle({
                  textTransform: value as NonNullable<typeof style.textTransform>,
                })
              }
            />
          </CompactFieldGrid>
          <CompactFieldGrid>
            <SegmentedControl
              label="Style"
              value={style.fontStyle ?? "normal"}
              options={fontStyleOptions}
              onChange={(value) =>
                updateStyle({
                  fontStyle: value as NonNullable<typeof style.fontStyle>,
                })
              }
            />
            <SegmentedControl
              label="Decoration"
              value={style.textDecoration ?? "none"}
              options={textDecorationOptions}
              onChange={(value) =>
                updateStyle({
                  textDecoration: value as NonNullable<typeof style.textDecoration>,
                })
              }
            />
          </CompactFieldGrid>
          <SegmentedControl
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
      ) : null}

      {hasSurfaceControls ? (
        <InspectorGroup title={element.type === "container" ? "Container Surface" : "Surface"}>
          <SegmentedControl
            label="Background"
            value={style.backgroundType ?? "solid"}
            options={[
              { label: "Solid", value: "solid" },
              { label: "Clear", value: "transparent" },
            ]}
            onChange={(value) =>
              updateStyle({
                backgroundType:
                  value as NonNullable<typeof style.backgroundType>,
                backgroundColor:
                  value === "transparent"
                    ? "transparent"
                    : style.backgroundColor,
              })
            }
          />
          <EditorField
            label="Background Color"
            type="color"
            value={
              style.backgroundColor && style.backgroundColor !== "transparent"
                ? style.backgroundColor
                : "#ffffff"
            }
            onChange={(value) => updateStyle({ backgroundColor: value })}
          />
          <EditorField
            label="Background Image URL"
            placeholder="https://... or /image.jpg"
            value={style.backgroundImage ?? ""}
            onChange={(value) => updateStyle({ backgroundImage: value })}
          />
          {style.backgroundImage ? (
            <>
              <CompactFieldGrid>
                <SelectField
                  label="BG Size"
                  options={backgroundSizeOptions}
                  value={style.backgroundSize ?? ""}
                  onChange={(value) =>
                    updateStyle({
                      backgroundSize: value as NonNullable<typeof style.backgroundSize>,
                    })
                  }
                />
                <SelectField
                  label="BG Position"
                  options={backgroundPositionOptions}
                  value={style.backgroundPosition ?? "center"}
                  onChange={(value) =>
                    updateStyle({
                      backgroundPosition: value as NonNullable<typeof style.backgroundPosition>,
                    })
                  }
                />
              </CompactFieldGrid>
              <SelectField
                label="BG Repeat"
                options={backgroundRepeatOptions}
                value={style.backgroundRepeat ?? "no-repeat"}
                onChange={(value) =>
                  updateStyle({
                    backgroundRepeat: value as NonNullable<typeof style.backgroundRepeat>,
                  })
                }
              />
            </>
          ) : null}
        </InspectorGroup>
      ) : null}

      {hasButtonControls ? (
        <InspectorGroup title="Button">
          <EditorField
            label="Button Background"
            type="color"
            value={style.buttonBackgroundColor || "#2a8f59"}
            onChange={(value) => updateStyle({ buttonBackgroundColor: value })}
          />
          <EditorField
            label="Button Text"
            type="color"
            value={style.buttonTextColor || "#ffffff"}
            onChange={(value) => updateStyle({ buttonTextColor: value })}
          />
          <SegmentedControl
            label="Button Width"
            value={style.buttonWidth ?? "auto"}
            options={[
              { label: "Auto", value: "auto" },
              { label: "Full", value: "full" },
            ]}
            onChange={(value) =>
              updateStyle({
                buttonWidth: value as NonNullable<typeof style.buttonWidth>,
              })
            }
          />
        </InspectorGroup>
      ) : null}

      {hasCardControls ? (
        <InspectorGroup title="Feature Cards">
          <EditorField
            label="Card Background"
            type="color"
            value={style.cardBackgroundColor || "#ffffff"}
            onChange={(value) => updateStyle({ cardBackgroundColor: value })}
          />
          <EditorField
            label="Card Border Color"
            type="color"
            value={style.cardBorderColor || "#e5e0d8"}
            onChange={(value) => updateStyle({ cardBorderColor: value })}
          />
          <CompactFieldGrid>
            <SelectField
              label="Card Radius"
              options={borderRadiusOptions}
              value={style.cardBorderRadius ?? ""}
              onChange={(value) => updateStyle({ cardBorderRadius: value })}
            />
            <SelectField
              label="Card Shadow"
              value={style.cardBoxShadow ?? ""}
              options={[
                { label: "None", value: "" },
                { label: "Soft", value: "0 10px 30px rgb(0 0 0 / 0.08)" },
                { label: "Strong", value: "0 18px 50px rgb(0 0 0 / 0.16)" },
              ]}
              onChange={(value) => updateStyle({ cardBoxShadow: value })}
            />
          </CompactFieldGrid>
        </InspectorGroup>
      ) : null}

      {hasSurfaceControls ? (
        <BorderAndEffectsControls style={style} onChange={updateStyle} />
      ) : null}
    </div>
  );
}

function BorderAndEffectsControls({
  onChange,
  style,
}: {
  onChange: (style: Partial<NonNullable<LyrixElement["props"]["style"]>>) => void;
  style: NonNullable<LyrixElement["props"]["style"]>;
}) {
  return (
    <>
      <InspectorGroup title="Border">
        <EditorField
          label="Border Color"
          type="color"
          value={style.borderColor || "#e5e0d8"}
          onChange={(value) => onChange({ borderColor: value })}
        />
        <CompactFieldGrid>
          <SelectField
            label="Width"
            options={borderWidthOptions}
            value={style.borderWidth ?? ""}
            onChange={(value) => onChange({ borderWidth: value })}
          />
          <SelectField
            label="Radius"
            options={borderRadiusOptions}
            value={style.borderRadius ?? ""}
            onChange={(value) => onChange({ borderRadius: value })}
          />
        </CompactFieldGrid>
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
          onChange={(value) => onChange({ boxShadow: value })}
        />
        <CompactFieldGrid>
          <SelectField
            label="Opacity"
            options={opacityOptions}
            value={style.opacity ?? ""}
            onChange={(value) => onChange({ opacity: value })}
          />
          <SelectField
            label="Overflow"
            options={overflowOptions}
            value={style.overflow ?? ""}
            onChange={(value) =>
              onChange({
                overflow: value as NonNullable<typeof style.overflow>,
              })
            }
          />
        </CompactFieldGrid>
        <SelectField
          label="Filter"
          options={filterOptions}
          value={style.filter ?? ""}
          onChange={(value) => onChange({ filter: value })}
        />
        <SelectField
          label="Blend Mode"
          options={blendModeOptions}
          value={style.mixBlendMode ?? ""}
          onChange={(value) => onChange({ mixBlendMode: value })}
        />
      </InspectorGroup>

      <InspectorGroup title="Interaction">
        <SelectField
          label="Transition"
          options={transitionOptions}
          value={style.transition ?? ""}
          onChange={(value) => onChange({ transition: value })}
        />
        <SelectField
          label="Cursor"
          options={cursorOptions}
          value={style.cursor ?? ""}
          onChange={(value) => onChange({ cursor: value })}
        />
        <EditorField
          label="Backdrop Filter"
          placeholder="blur(8px) or brightness(0.8)"
          value={style.backdropFilter ?? ""}
          onChange={(value) => onChange({ backdropFilter: value })}
        />
      </InspectorGroup>
    </>
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
  const layout = element.props.layout ?? {};

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

  function updateLayout(nextLayout: Partial<LyrixContainerLayout>) {
    onChange({
      layout: {
        ...layout,
        ...nextLayout,
      },
    });
  }

  return (
    <div className="grid gap-4">
      {element.type === "container" ? (
        <InspectorGroup title="Container Size">
          <SegmentedControl
            label="Content Width"
            value={layout.contentWidth ?? "boxed"}
            options={contentWidthOptions}
            onChange={(value) =>
              updateLayout({
                contentWidth: value as LyrixContainerLayout["contentWidth"],
              })
            }
          />
          <CompactFieldGrid>
            <EditorField
              label="Width"
              placeholder="1140"
              help="Boxed container width in pixels."
              value={layout.width ?? ""}
              onChange={(value) => updateLayout({ width: value })}
            />
            <UnitField
              label="Min Height"
              help="Optional minimum height for this container."
              value={layout.minHeight ?? ""}
              unit={layout.minHeightUnit ?? "px"}
              units={["px", "vh"]}
              onValueChange={(value) => updateLayout({ minHeight: value })}
              onUnitChange={(value) =>
                updateLayout({
                  minHeightUnit: value as LyrixContainerLayout["minHeightUnit"],
                })
              }
            />
          </CompactFieldGrid>
        </InspectorGroup>
      ) : null}

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
        <SegmentedControl
          label="Width"
          value={advanced.widthMode ?? "default"}
          options={[
            { label: "Default", value: "default" },
            { label: "Full", value: "full" },
            { label: "Inline", value: "inline" },
            { label: "Custom", value: "custom" },
          ]}
          columns={2}
          onChange={(value) =>
            updateAdvanced({
              widthMode: value as NonNullable<typeof advanced.widthMode>,
              width:
                value === "full"
                  ? "100%"
                  : value === "inline"
                    ? "auto"
                    : value === "default"
                      ? ""
                      : advanced.width,
            })
          }
        />
        {advanced.widthMode === "custom" ? (
          <EditorField
            label="Custom Width"
            placeholder="320px, 50%, or 20rem"
            help="Any valid CSS width."
            value={advanced.width ?? ""}
            onChange={(value) => updateAdvanced({ width: value })}
          />
        ) : null}
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
        <SegmentedControl
          label="Order"
          value={advanced.orderMode ?? "default"}
          options={orderModeOptions}
          columns={2}
          onChange={(value) =>
            updateAdvanced({
              orderMode: value as NonNullable<typeof advanced.orderMode>,
              order:
                value === "start"
                  ? "-9999"
                  : value === "end"
                    ? "9999"
                    : value === "default"
                      ? ""
                      : advanced.order,
            })
          }
        />
        {advanced.orderMode === "custom" ? (
          <EditorField
            label="Custom Order"
            placeholder="0"
            help="Lower numbers appear first."
            value={advanced.order ?? ""}
            onChange={(value) => updateAdvanced({ order: value })}
          />
        ) : null}
        <SegmentedControl
          label="Size"
          value={advanced.sizeMode ?? "default"}
          options={sizeModeOptions}
          columns={3}
          onChange={(value) =>
            updateAdvanced({
              sizeMode: value as NonNullable<typeof advanced.sizeMode>,
              flexGrow:
                value === "grow" ? "1" : value === "none" ? "0" : advanced.flexGrow,
              flexShrink:
                value === "shrink"
                  ? "1"
                  : value === "none"
                    ? "0"
                    : advanced.flexShrink,
            })
          }
        />
        {advanced.sizeMode === "custom" ? (
          <CompactFieldGrid>
            <EditorField
              label="Flex Grow"
              placeholder="1"
              help="How much this item grows."
              value={advanced.flexGrow ?? ""}
              onChange={(value) => updateAdvanced({ flexGrow: value })}
            />
            <EditorField
              label="Flex Shrink"
              placeholder="1"
              help="How much this item shrinks."
              value={advanced.flexShrink ?? ""}
              onChange={(value) => updateAdvanced({ flexShrink: value })}
            />
          </CompactFieldGrid>
        ) : null}
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
        <SelectField
          label="Z-Index"
          options={zIndexOptions}
          value={advanced.zIndex ?? ""}
          onChange={(value) => updateAdvanced({ zIndex: value })}
        />
      </InspectorGroup>

      <InspectorGroup title="Attributes">
        <EditorField
          label="CSS ID"
          placeholder="hero-section"
          help="Use one unique ID, without #."
          value={advanced.cssId ?? ""}
          onChange={(value) => updateAdvanced({ cssId: value })}
        />
        <EditorField
          label="CSS Classes"
          placeholder="featured-section dark-card"
          help="Separate multiple classes with spaces."
          value={advanced.cssClasses ?? ""}
          onChange={(value) => updateAdvanced({ cssClasses: value })}
        />
      </InspectorGroup>
    </div>
  );
}

function EditorField({
  help,
  label,
  placeholder,
  type = "text",
  value,
  onChange,
}: {
  help?: string;
  label: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (value: string) => void;
}) {
  if (type === "color") {
    return (
      <ColorField
        help={help}
        label={label}
        value={value}
        onChange={onChange}
      />
    );
  }

  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <input
        className="h-9 min-w-0 border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-primary"
        placeholder={placeholder}
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      {help ? (
        <span className="text-[11px] leading-4 text-muted-foreground">{help}</span>
      ) : null}
    </label>
  );
}

function ColorField({
  help,
  label,
  value,
  onChange,
}: {
  help?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const colorValue = isHexColor(value) ? value : "#ffffff";

  return (
    <div className="grid min-w-0 gap-2">
      <span className="text-xs font-medium">{label}</span>
      <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-2">
        <label
          className="relative grid size-9 cursor-pointer place-items-center border border-border bg-background shadow-sm transition-colors hover:border-primary"
          title={`Pick ${label.toLowerCase()}`}
        >
          <span
            className="size-6 border border-black/15 shadow-inner"
            style={{ backgroundColor: colorValue }}
          />
          <input
            aria-label={label}
            className="absolute inset-0 cursor-pointer opacity-0"
            type="color"
            value={colorValue}
            onChange={(event) => onChange(event.target.value)}
          />
        </label>
        <input
          className="h-9 min-w-0 border border-border bg-background px-3 font-mono text-xs uppercase outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-primary"
          placeholder="#2A8F59"
          value={value}
          onChange={(event) => onChange(event.target.value)}
        />
      </div>
      <div className="grid grid-cols-8 gap-1">
        {colorSwatches.map((swatch) => (
          <button
            key={swatch}
            type="button"
            aria-label={`Use ${swatch}`}
            className={`size-6 border transition-transform hover:-translate-y-0.5 ${
              value.toLowerCase() === swatch
                ? "border-foreground"
                : "border-border"
            }`}
            style={{ backgroundColor: swatch }}
            onClick={() => onChange(swatch)}
          />
        ))}
      </div>
      {help ? (
        <span className="text-[11px] leading-4 text-muted-foreground">{help}</span>
      ) : null}
    </div>
  );
}

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
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
      className={`min-w-0 border-b-2 px-2 py-3 font-medium transition-colors ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted-foreground hover:text-foreground"
      }`}
    >
      <span className="block truncate">{label}</span>
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
    <section className="grid min-w-0 gap-3 border-b border-border pb-4">
      <h3 className="text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function SelectField({
  help,
  label,
  onChange,
  options,
  value,
}: {
  help?: string;
  label: string;
  onChange: (value: string) => void;
  options: Array<{ label: string; value: string }>;
  value: string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <select
        className="h-9 min-w-0 border border-border bg-background px-3 text-sm outline-none transition-colors focus-visible:border-primary"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {help ? (
        <span className="text-[11px] leading-4 text-muted-foreground">{help}</span>
      ) : null}
    </label>
  );
}

function SegmentedControl({
  columns,
  label,
  onChange,
  options,
  value,
}: {
  columns?: 2 | 3 | 4;
  label: string;
  onChange: (value: string) => void;
  options: Option[];
  value: string;
}) {
  const columnClass =
    columns === 2
      ? "grid-cols-2"
      : columns === 3
        ? "grid-cols-3"
        : columns === 4
          ? "grid-cols-4"
          : options.length > 4
            ? "grid-cols-3"
            : options.length > 2
              ? "grid-cols-2"
              : "grid-cols-2";

  return (
    <div className="grid min-w-0 gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <div
        className={`grid ${columnClass} overflow-hidden border border-border bg-muted/40 text-[11px]`}
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={`min-h-8 min-w-0 border-b border-r border-border/70 px-2 font-medium transition-colors last:border-r-0 ${
              value === option.value
                ? "bg-foreground text-background"
                : "bg-background text-muted-foreground hover:text-foreground"
            }`}
            title={option.label}
          >
            <span className="block truncate">{option.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function CompactFieldGrid({ children }: { children: React.ReactNode }) {
  return <div className="grid min-w-0 grid-cols-2 gap-2">{children}</div>;
}

function UnitField({
  help,
  label,
  onUnitChange,
  onValueChange,
  unit,
  units,
  value,
}: {
  help?: string;
  label: string;
  onUnitChange: (unit: string) => void;
  onValueChange: (value: string) => void;
  unit: string;
  units: string[];
  value: string;
}) {
  return (
    <label className="grid min-w-0 gap-1.5">
      <span className="text-xs font-medium">{label}</span>
      <span className="grid min-w-0 grid-cols-[minmax(0,1fr)_4rem]">
        <input
          className="h-9 min-w-0 border border-r-0 border-border bg-background px-2 text-sm outline-none transition-colors focus-visible:border-primary"
          value={value}
          onChange={(event) => onValueChange(event.target.value)}
        />
        <select
          className="h-9 min-w-0 border border-border bg-background px-1 text-xs outline-none transition-colors focus-visible:border-primary"
          value={unit}
          onChange={(event) => onUnitChange(event.target.value)}
        >
          {units.map((unitOption) => (
            <option key={unitOption} value={unitOption}>
              {unitOption}
            </option>
          ))}
        </select>
      </span>
      {help ? (
        <span className="text-[11px] leading-4 text-muted-foreground">{help}</span>
      ) : null}
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
    <div className="grid min-w-0 gap-2">
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
          <option value="em">em</option>
          <option value="rem">rem</option>
          <option value="vh">vh</option>
          <option value="vw">vw</option>
        </select>
      </div>
      <div className="grid min-w-0 grid-cols-4">
        {(["top", "right", "bottom", "left"] as const).map((side) => (
          <label key={side} className="grid min-w-0 gap-1">
            <input
              className="h-8 min-w-0 border border-border bg-background px-1 text-center text-xs outline-none focus-visible:border-primary"
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
      className={`flex h-12 w-12 items-center justify-center border-r border-primary-foreground/10 transition-colors ${
        active
          ? "bg-primary-foreground/20 text-primary-foreground"
          : "text-primary-foreground/75 hover:bg-primary-foreground/10 hover:text-primary-foreground"
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
      className="flex h-12 w-12 items-center justify-center border-r border-primary-foreground/10 text-primary-foreground/75 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
      title={label}
    >
      {children}
    </Link>
  );
}
