import type { CSSProperties } from "react";
import type {
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
  }
}

function HeadingElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-4")}>
      {element.props.eyebrow ? <Eyebrow>{element.props.eyebrow}</Eyebrow> : null}
      <h2 className={`${element.props.eyebrow ? "mt-1" : ""} max-w-3xl ${nested ? "text-2xl" : "text-4xl"} font-semibold tracking-normal`}>
        {element.props.title}
      </h2>
    </section>
  );
}

function ContainerElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-2" : "container-layout py-4")}>
      <div className="min-h-12">
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
      <h1 className={`${element.props.eyebrow ? "mt-2" : ""} max-w-4xl ${nested ? "text-3xl" : "text-5xl"} font-bold tracking-normal`}>
        {element.props.title}
      </h1>
      {element.props.body ? (
        <p className="mt-2 max-w-2xl text-base leading-7 text-muted-foreground">
          {element.props.body}
        </p>
      ) : null}
      {element.props.buttonLabel ? (
        <a
          className="mt-4 inline-flex h-10 items-center rounded-lg border-2 border-[color-mix(in_oklch,var(--color-primary)_40%,black)] bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--color-primary)_40%,black)] transition-all hover:-translate-y-0.5"
          href={element.props.buttonHref || "#"}
        >
          {element.props.buttonLabel}
        </a>
      ) : null}
    </section>
  );
}

function TextElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-4")}>
      {element.props.eyebrow ? <Eyebrow>{element.props.eyebrow}</Eyebrow> : null}
      <h2 className={`${element.props.eyebrow ? "mt-2" : ""} max-w-3xl ${nested ? "text-xl" : "text-3xl"} font-semibold tracking-normal`}>
        {element.props.title}
      </h2>
      {element.props.body ? (
        <p className="mt-2 max-w-3xl text-base leading-7 text-muted-foreground">
          {element.props.body}
        </p>
      ) : null}
    </section>
  );
}

function ButtonElement({ element, nested = false }: LyrixElementViewProps) {
  return (
    <section {...elementAttrs(element, nested ? "py-1" : "container-layout py-3")}>
      <a
        className="inline-flex h-10 items-center rounded-lg border-2 border-[color-mix(in_oklch,var(--color-primary)_40%,black)] bg-primary px-5 text-sm font-bold text-primary-foreground shadow-[0_4px_0_0_color-mix(in_oklch,var(--color-primary)_40%,black)] transition-all hover:-translate-y-0.5"
        href={element.props.buttonHref || "#"}
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
      <hr className="border-border" />
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
      <h2 className={`${element.props.eyebrow ? "mt-2" : ""} max-w-3xl ${nested ? "text-2xl" : "text-3xl"} font-semibold tracking-normal`}>
        {element.props.title}
      </h2>
      {element.props.body ? (
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          {element.props.body}
        </p>
      ) : null}
      <div className="mt-4 grid gap-2 md:grid-cols-3">
        {items.map((item) => (
          <div
            key={item}
            className="rounded-lg border border-border bg-card p-3 text-sm font-medium"
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
      <div className="rounded-lg border border-border bg-card p-4">
        {element.props.eyebrow ? <Eyebrow>{element.props.eyebrow}</Eyebrow> : null}
        <div className="mt-2 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className={`${nested ? "text-2xl" : "text-3xl"} font-semibold tracking-normal`}>
              {element.props.title}
            </h2>
            {element.props.body ? (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                {element.props.body}
              </p>
            ) : null}
          </div>
          {element.props.buttonLabel ? (
            <a
              className="inline-flex h-10 shrink-0 items-center rounded-lg border-2 border-foreground px-5 text-sm font-bold shadow-[0_4px_0_0_var(--color-foreground)] transition-all hover:-translate-y-0.5"
              href={element.props.buttonHref || "#"}
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

function elementStyle(element: LyrixElement): CSSProperties {
  const style = element.props.style;
  const advanced = element.props.advanced;

  return {
    ...spacingStyle("margin", advanced?.margin),
    ...spacingStyle("padding", advanced?.padding),
    alignSelf: advanced?.alignSelf === "auto" ? undefined : advanced?.alignSelf,
    backgroundColor: style?.backgroundColor || undefined,
    borderColor: style?.borderColor || undefined,
    borderRadius: toCssUnit(style?.borderRadius),
    borderStyle: style?.borderColor || style?.borderWidth ? "solid" : undefined,
    borderWidth: toCssUnit(style?.borderWidth),
    boxShadow: style?.boxShadow || undefined,
    color: style?.textColor || undefined,
    order: advanced?.order ? Number(advanced.order) : undefined,
    position:
      advanced?.position && advanced.position !== "default"
        ? advanced.position
        : undefined,
    textAlign: style?.alignment,
    width: advanced?.width || undefined,
    zIndex: advanced?.zIndex ? Number(advanced.zIndex) : undefined,
  };
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

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
      {children}
    </p>
  );
}
