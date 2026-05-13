import type { CSSProperties } from "react";
import { Layers } from "lucide-react";
import type {
  LyrixContainerLayout,
  LyrixElement,
  LyrixPageDocument,
  LyrixSpacing,
} from "@/lib/lyrix-document";

type LyrixRendererProps = {
  document: LyrixPageDocument;
};

type LyrixElementViewProps = {
  element: LyrixElement;
  nested?: boolean;
};

export function LyrixRenderer({ document }: LyrixRendererProps) {
  return (
    <main className="min-h-screen bg-background text-foreground">
      {document.elements.map((element) => (
        <LyrixElementView key={element.id} element={element} />
      ))}
    </main>
  );
}

export function LyrixElementView({ element, nested = false }: LyrixElementViewProps) {
  switch (element.type) {
    case "container":
      return <ContainerElement element={element} nested={nested} />;
    case "hero":
      return <HeroElement element={element} nested={nested} />;
    case "heading":
      return <HeadingElement element={element} nested={nested} />;
    case "text":
      return <TextElement element={element} nested={nested} />;
    case "video":
      return <VideoElement element={element} nested={nested} />;
    case "icon-list":
      return <IconListElement element={element} nested={nested} />;
    case "button":
      return <ButtonElement element={element} nested={nested} />;
    case "image":
      return <ImageElement element={element} nested={nested} />;
    case "divider":
      return <DividerElement element={element} nested={nested} />;
    case "spacer":
      return <SpacerElement element={element} />;
    case "feature-grid":
      return <FeatureGridElement element={element} nested={nested} />;
    case "cta":
      return <CtaElement element={element} nested={nested} />;
    case "block-ref":
      return <BlockRefElement element={element} />;
  }
}

function BlockRefElement({ element }: LyrixElementViewProps) {
  return (
    <section className="container-layout py-3">
      <div className="flex items-center gap-3 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary/10">
          <Layers className="size-4 text-primary" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-foreground">{element.props.title}</p>
          <p className="truncate text-xs text-muted-foreground">
            Reusable Block · {element.props.blockSlug}
          </p>
        </div>
        <span className="ml-auto shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
          Block
        </span>
      </div>
    </section>
  );
}

function HeadingElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-4")}>
      {element.props.eyebrow ? <Eyebrow>{element.props.eyebrow}</Eyebrow> : null}
      <h2
        className={`${element.props.eyebrow ? "mt-1" : ""} max-w-3xl ${nested ? "text-2xl" : "text-4xl"} font-semibold tracking-normal`}
        style={textNodeStyle(element, "title")}
      >
        {element.props.title}
      </h2>
    </section>
  );
}

function ContainerElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-2" : "container-layout py-4")}>
      <div
        className="min-h-12"
        data-grid-outline={element.props.layout?.gridOutline}
        style={containerLayoutStyle(element.props.layout)}
      >
        {element.children?.length ? (
          element.children.map((child) => (
            <LyrixElementView key={child.id} element={child} nested />
          ))
        ) : (
          <div className="min-h-12" />
        )}
      </div>
    </section>
  );
}

function HeroElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-2" : "container-layout py-8")}>
      {element.props.eyebrow ? <Eyebrow>{element.props.eyebrow}</Eyebrow> : null}
      <h1
        className={`${element.props.eyebrow ? "mt-2" : ""} max-w-4xl ${nested ? "text-3xl" : "text-5xl"} font-bold tracking-normal`}
        style={textNodeStyle(element, "title")}
      >
        {element.props.title}
      </h1>
      {element.props.body ? (
        <p
          className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground"
          style={textNodeStyle(element, "body")}
        >
          {element.props.body}
        </p>
      ) : null}
      {element.props.buttonLabel ? (
        <a
          className="mt-4 inline-flex h-10 items-center rounded-lg border-2 border-[color-mix(in_oklch,var(--color-primary)_40%,black)] bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--color-primary)_40%,black)] transition-all hover:-translate-y-0.5"
          href={element.props.buttonHref || "#"}
          style={buttonNodeStyle(element)}
        >
          {element.props.buttonLabel}
        </a>
      ) : null}
    </section>
  );
}

function TextElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-3")}>
      <p
        className="max-w-3xl whitespace-pre-line text-base leading-7 text-muted-foreground"
        style={textNodeStyle(element, "body")}
      >
        {element.props.body || element.props.title}
      </p>
    </section>
  );
}

function VideoElement({ element, nested = false }: LyrixElementViewProps) {
  const embedUrl = toVideoEmbedUrl(element.props.videoUrl);

  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-3")}>
      <div
        className="overflow-hidden rounded-lg border border-border bg-card"
        style={{
          ...mediaNodeStyle(element),
          minHeight: `${Number(element.props.height) || 320}px`,
        }}
      >
        {embedUrl ? (
          <iframe
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="h-full min-h-[inherit] w-full"
            loading="lazy"
            src={embedUrl}
            title={element.props.title}
          />
        ) : (
          <div className="grid min-h-[inherit] place-items-center p-6 text-sm text-muted-foreground">
            Add a YouTube or Vimeo URL.
          </div>
        )}
      </div>
    </section>
  );
}

function IconListElement({ element, nested = false }: LyrixElementViewProps) {
  const items = element.props.items?.length
    ? element.props.items
    : ["First item", "Second item", "Third item"];
  const bulletStyle = element.props.style?.bulletStyle ?? "dot";
  const bulletColor = element.props.style?.bulletColor;

  function BulletIcon() {
    const colorStyle = bulletColor ? { color: bulletColor } : undefined;
    if (bulletStyle === "check") {
      return <span className="mt-0.5 font-bold text-primary" style={colorStyle} aria-hidden>✓</span>;
    }
    if (bulletStyle === "dash") {
      return <span className="mt-0.5 text-muted-foreground" style={colorStyle} aria-hidden>—</span>;
    }
    if (bulletStyle === "arrow") {
      return <span className="mt-0.5 text-primary" style={colorStyle} aria-hidden>→</span>;
    }
    return (
      <span
        className="mt-2 size-2 shrink-0 rounded-full bg-primary"
        style={bulletColor ? { backgroundColor: bulletColor } : undefined}
        aria-hidden
      />
    );
  }

  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-3")}>
      <ul className="grid max-w-3xl gap-2">
        {items.map((item) => (
          <li
            key={item}
            className="grid grid-cols-[auto_minmax(0,1fr)] items-start gap-2 text-sm leading-6"
            style={textNodeStyle(element, "body")}
          >
            <BulletIcon />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ButtonElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-3")}>
      <a
        className="inline-flex h-10 items-center rounded-lg border-2 border-[color-mix(in_oklch,var(--color-primary)_40%,black)] bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--color-primary)_40%,black)] transition-all hover:-translate-y-0.5"
        href={element.props.buttonHref || "#"}
        style={buttonNodeStyle(element)}
      >
        {element.props.buttonLabel || element.props.title}
      </a>
    </section>
  );
}

function ImageElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-3")}>
      <div
        aria-label={element.props.imageAlt || element.props.title}
        className="rounded-lg border border-border bg-card bg-contain bg-center bg-no-repeat"
        role="img"
        style={{
          ...mediaNodeStyle(element),
          backgroundImage: `url(${element.props.imageSrc || "/window.svg"})`,
          minHeight: `${Number(element.props.height) || 180}px`,
        }}
      />
    </section>
  );
}

function DividerElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-2")}>
      <hr className="border-border" style={dividerNodeStyle(element)} />
    </section>
  );
}

function SpacerElement({ element }: LyrixElementViewProps) {
  return (
    <div
      {...elementAttrs(element, "")}
      aria-hidden
      style={{
        ...elementStyle(element),
        height: `${Number(element.props.height) || 24}px`,
      }}
    />
  );
}

function FeatureGridElement({ element, nested = false }: LyrixElementViewProps) {
  const items = element.props.items?.length
    ? element.props.items
    : ["First feature", "Second feature", "Third feature"];

  return (
    <section {...elementAttrs(element, nested ? "py-2" : "container-layout py-5")}>
      {element.props.eyebrow ? <Eyebrow>{element.props.eyebrow}</Eyebrow> : null}
      <h2
        className={`${element.props.eyebrow ? "mt-2" : ""} max-w-3xl ${nested ? "text-2xl" : "text-3xl"} font-semibold tracking-normal`}
        style={textNodeStyle(element, "title")}
      >
        {element.props.title}
      </h2>
      {element.props.body ? (
        <p
          className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground"
          style={textNodeStyle(element, "body")}
        >
          {element.props.body}
        </p>
      ) : null}
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-lg border border-border bg-card p-3 text-sm font-medium"
            style={cardNodeStyle(element)}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}

function CtaElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-2" : "container-layout py-5")}>
      <div className="rounded-lg border border-border bg-card p-4" style={surfaceNodeStyle(element)}>
        {element.props.eyebrow ? <Eyebrow>{element.props.eyebrow}</Eyebrow> : null}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className={`${nested ? "text-2xl" : "text-3xl"} font-semibold tracking-normal`}
              style={textNodeStyle(element, "title")}
            >
              {element.props.title}
            </h2>
            {element.props.body ? (
              <p
                className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground"
                style={textNodeStyle(element, "body")}
              >
                {element.props.body}
              </p>
            ) : null}
          </div>
          {element.props.buttonLabel ? (
            <a
              className="inline-flex h-10 shrink-0 items-center rounded-lg border-2 border-foreground px-5 text-sm font-bold shadow-[0_4px_0_0_var(--color-foreground)] transition-all hover:-translate-y-0.5"
              href={element.props.buttonHref || "#"}
              style={buttonNodeStyle(element)}
            >
              {element.props.buttonLabel}
            </a>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function elementAttrs(element: LyrixElement, className: string) {
  return {
    id: element.props.advanced?.cssId || undefined,
    className: [className, element.props.advanced?.cssClasses]
      .filter(Boolean)
      .join(" "),
    style: elementStyle(element),
  };
}

export function elementStyle(element: LyrixElement): CSSProperties {
  const style = element.props.style;
  const advanced = element.props.advanced;

  return {
    ...spacingStyle("margin", advanced?.margin),
    ...spacingStyle("padding", advanced?.padding),
    alignSelf: advanced?.alignSelf === "auto" ? undefined : advanced?.alignSelf,
    backdropFilter: style?.backdropFilter || undefined,
    backgroundColor: style?.backgroundColor || undefined,
    backgroundImage: style?.backgroundImage ? `url(${style.backgroundImage})` : undefined,
    backgroundPosition: style?.backgroundPosition || undefined,
    backgroundRepeat: style?.backgroundRepeat || undefined,
    backgroundSize: style?.backgroundSize || undefined,
    borderColor: style?.borderColor || undefined,
    borderRadius: toCssUnit(style?.borderRadius),
    borderStyle: style?.borderColor || style?.borderWidth ? "solid" : undefined,
    borderWidth: toCssUnit(style?.borderWidth),
    boxShadow: style?.boxShadow || undefined,
    color: style?.textColor || undefined,
    cursor: style?.cursor || undefined,
    filter: style?.filter || undefined,
    mixBlendMode: (style?.mixBlendMode as CSSProperties["mixBlendMode"]) || undefined,
    opacity: style?.opacity ? Number(style.opacity) / 100 : undefined,
    order: advanced?.order ? Number(advanced.order) : undefined,
    overflow: style?.overflow || undefined,
    position:
      advanced?.position && advanced.position !== "default"
        ? advanced.position
        : undefined,
    textAlign: style?.alignment,
    transition: style?.transition || undefined,
    width: advanced?.width || undefined,
    flexGrow: advanced?.flexGrow ? Number(advanced.flexGrow) : undefined,
    flexShrink: advanced?.flexShrink ? Number(advanced.flexShrink) : undefined,
    zIndex: advanced?.zIndex ? Number(advanced.zIndex) : undefined,
  };
}

function textNodeStyle(
  element: LyrixElement,
  target: "title" | "body"
): CSSProperties {
  const style = element.props.style;

  return {
    color:
      target === "title"
        ? style?.titleColor || style?.textColor
        : style?.bodyColor || style?.textColor,
    fontSize: toCssUnit(
      target === "title" ? style?.fontSize : style?.bodyFontSize
    ),
    fontStyle: style?.fontStyle || undefined,
    fontWeight:
      target === "body"
        ? style?.bodyWeight || style?.fontWeight
        : style?.fontWeight,
    letterSpacing: style?.letterSpacing
      ? toCssUnit(style.letterSpacing, "em")
      : undefined,
    lineHeight: style?.lineHeight,
    textAlign: style?.alignment,
    textDecoration: style?.textDecoration || undefined,
    textTransform: style?.textTransform || undefined,
  };
}

function buttonNodeStyle(element: LyrixElement): CSSProperties {
  const style = element.props.style;

  return {
    backgroundColor: style?.buttonBackgroundColor || style?.backgroundColor,
    borderColor: style?.borderColor,
    borderRadius: toCssUnit(style?.borderRadius),
    borderWidth: toCssUnit(style?.borderWidth),
    boxShadow: style?.boxShadow,
    color: style?.buttonTextColor || style?.textColor,
    fontSize: toCssUnit(style?.fontSize),
    fontWeight: style?.fontWeight,
    letterSpacing: style?.letterSpacing
      ? toCssUnit(style.letterSpacing, "em")
      : undefined,
    lineHeight: style?.lineHeight,
    textDecoration: style?.textDecoration || undefined,
    textTransform: style?.textTransform || undefined,
    width: style?.buttonWidth === "full" ? "100%" : undefined,
  };
}

function mediaNodeStyle(element: LyrixElement): CSSProperties {
  const style = element.props.style;

  return {
    backgroundColor: style?.backgroundColor,
    backgroundSize: style?.imageFit ?? "contain",
    borderColor: style?.borderColor,
    borderRadius: toCssUnit(style?.borderRadius),
    borderWidth: toCssUnit(style?.borderWidth),
    boxShadow: style?.boxShadow,
    filter: style?.filter || undefined,
    mixBlendMode: (style?.mixBlendMode as CSSProperties["mixBlendMode"]) || undefined,
  };
}

function dividerNodeStyle(element: LyrixElement): CSSProperties {
  const style = element.props.style;

  return {
    borderColor: style?.dividerColor || style?.borderColor,
    borderStyle: style?.dividerStyle || undefined,
    borderTopWidth: toCssUnit(style?.dividerWidth || style?.borderWidth),
  };
}

function surfaceNodeStyle(element: LyrixElement): CSSProperties {
  const style = element.props.style;

  return {
    backgroundColor:
      style?.backgroundType === "transparent"
        ? "transparent"
        : style?.backgroundColor,
    backgroundImage: style?.backgroundImage ? `url(${style.backgroundImage})` : undefined,
    backgroundPosition: style?.backgroundPosition || undefined,
    backgroundRepeat: style?.backgroundRepeat || undefined,
    backgroundSize: style?.backgroundSize || undefined,
    borderColor: style?.borderColor,
    borderRadius: toCssUnit(style?.borderRadius),
    borderWidth: toCssUnit(style?.borderWidth),
    boxShadow: style?.boxShadow,
    color: style?.textColor,
    overflow: style?.overflow || undefined,
  };
}

function cardNodeStyle(element: LyrixElement): CSSProperties {
  const style = element.props.style;

  return {
    backgroundColor: style?.cardBackgroundColor || undefined,
    borderColor: style?.cardBorderColor || undefined,
    borderRadius: style?.cardBorderRadius ? toCssUnit(style.cardBorderRadius) : undefined,
    boxShadow: style?.cardBoxShadow || undefined,
  };
}

export function containerLayoutStyle(
  layout?: LyrixContainerLayout
): CSSProperties {
  const resolved = layout ?? {};
  const isGrid = resolved.containerType === "grid";
  const contentWidth = resolved.contentWidth ?? "boxed";
  const width = toCssUnit(resolved.width, "px");
  const minHeight = toCssUnit(
    resolved.minHeight,
    resolved.minHeightUnit ?? "px"
  );
  const gridGapUnit = resolved.gridGapUnit ?? "px";

  return {
    display: isGrid ? "grid" : "flex",
    width: contentWidth === "full" ? "100%" : width || "100%",
    maxWidth: contentWidth === "boxed" ? width || "1140px" : undefined,
    minHeight,
    marginLeft: contentWidth === "boxed" ? "auto" : undefined,
    marginRight: contentWidth === "boxed" ? "auto" : undefined,
    flexDirection: !isGrid ? resolved.direction ?? "column" : undefined,
    justifyContent: !isGrid
      ? resolved.justifyContent ?? "flex-start"
      : resolved.gridJustifyContent,
    alignItems: !isGrid
      ? resolved.alignItems ?? "stretch"
      : resolved.gridAlignItems,
    flexWrap: !isGrid ? resolved.wrap ?? "nowrap" : undefined,
    gridTemplateColumns: isGrid
      ? gridTemplate(resolved.columns, resolved.columnUnit, resolved.columnTemplate)
      : undefined,
    gridTemplateRows: isGrid
      ? gridTemplate(resolved.rows, resolved.rowUnit, resolved.rowTemplate)
      : undefined,
    columnGap: isGrid
      ? toCssUnit(resolved.columnGap ?? "20", gridGapUnit)
      : toCssUnit(resolved.gap ?? "20", resolved.gapUnit ?? "px"),
    rowGap: isGrid
      ? toCssUnit(resolved.rowGap ?? "20", gridGapUnit)
      : toCssUnit(resolved.gap ?? "20", resolved.gapUnit ?? "px"),
    gridAutoFlow: isGrid ? resolved.autoFlow ?? "row" : undefined,
    justifyItems: isGrid ? resolved.gridJustifyItems ?? "stretch" : undefined,
    alignContent: isGrid ? resolved.gridAlignContent ?? "start" : undefined,
  };
}

function gridTemplate(
  count?: string,
  unit?: LyrixContainerLayout["columnUnit"],
  customTemplate?: string
) {
  if (unit === "custom") {
    return customTemplate || undefined;
  }

  const safeCount = Math.max(1, Number(count) || 1);

  return `repeat(${safeCount}, minmax(0, 1fr))`;
}

function spacingStyle(
  property: "margin" | "padding",
  spacing?: LyrixSpacing
): CSSProperties {
  if (!spacing) {
    return {};
  }

  const unit = spacing.unit ?? "px";
  const prefix = property === "margin" ? "margin" : "padding";

  return {
    [`${prefix}Top`]: toCssUnit(spacing.top, unit),
    [`${prefix}Right`]: toCssUnit(spacing.right, unit),
    [`${prefix}Bottom`]: toCssUnit(spacing.bottom, unit),
    [`${prefix}Left`]: toCssUnit(spacing.left, unit),
  } as CSSProperties;
}

function toCssUnit(value?: string, unit = "px") {
  if (!value) {
    return undefined;
  }

  if (/^-?\d+(\.\d+)?$/.test(value)) {
    return `${value}${unit}`;
  }

  return value;
}

function toVideoEmbedUrl(value?: string) {
  if (!value) {
    return "";
  }

  try {
    const url = new URL(value);

    if (url.hostname.includes("youtube.com")) {
      const videoId = url.searchParams.get("v");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : value;
    }

    if (url.hostname.includes("youtu.be")) {
      const videoId = url.pathname.replace("/", "");
      return videoId ? `https://www.youtube.com/embed/${videoId}` : value;
    }

    if (url.hostname.includes("vimeo.com")) {
      const videoId = url.pathname.split("/").filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : value;
    }

    return value;
  } catch {
    return "";
  }
}

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}
