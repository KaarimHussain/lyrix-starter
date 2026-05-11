export type LyrixElementType =
  | "container"
  | "heading"
  | "hero"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "text"
  | "video"
  | "icon-list"
  | "cta"
  | "feature-grid";

export type LyrixSpacing = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  unit?: "px" | "%" | "em" | "rem" | "vh" | "vw";
};

export type LyrixContainerLayout = {
  containerType?: "flex" | "grid";
  contentWidth?: "boxed" | "full";
  width?: string;
  minHeight?: string;
  minHeightUnit?: "px" | "vh";
  direction?: "row" | "column" | "row-reverse" | "column-reverse";
  justifyContent?:
    | "flex-start"
    | "center"
    | "flex-end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  alignItems?: "flex-start" | "center" | "flex-end" | "stretch";
  gap?: string;
  gapUnit?: "px" | "%" | "vw";
  wrap?: "nowrap" | "wrap" | "wrap-reverse";
  gridOutline?: "show" | "hide";
  columns?: string;
  columnUnit?: "fr" | "custom";
  columnTemplate?: string;
  rows?: string;
  rowUnit?: "fr" | "custom";
  rowTemplate?: string;
  columnGap?: string;
  rowGap?: string;
  gridGapUnit?: "px" | "%" | "rem" | "vw";
  autoFlow?: "row" | "column" | "dense" | "row dense" | "column dense";
  gridJustifyItems?: "start" | "center" | "end" | "stretch";
  gridAlignItems?: "start" | "center" | "end" | "stretch";
  gridJustifyContent?:
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly";
  gridAlignContent?:
    | "start"
    | "center"
    | "end"
    | "space-between"
    | "space-around"
    | "space-evenly";
};

export type LyrixElementStyle = {
  // ── existing ──
  backgroundType?: "solid" | "transparent";
  backgroundColor?: string;
  textColor?: string;
  titleColor?: string;
  bodyColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  opacity?: string;
  boxShadow?: string;
  alignment?: "left" | "center" | "right";
  fontSize?: string;
  bodyFontSize?: string;
  fontWeight?: string;
  lineHeight?: string;
  buttonBackgroundColor?: string;
  buttonTextColor?: string;
  imageFit?: "contain" | "cover";
  dividerColor?: string;
  dividerWidth?: string;
  // ── typography extensions ──
  letterSpacing?: string;
  textTransform?: "uppercase" | "lowercase" | "capitalize";
  fontStyle?: "normal" | "italic";
  textDecoration?: "none" | "underline" | "line-through";
  bodyWeight?: string;
  // ── background image ──
  backgroundImage?: string;
  backgroundSize?: "cover" | "contain" | "auto";
  backgroundPosition?: "center" | "top" | "bottom" | "left" | "right";
  backgroundRepeat?: "no-repeat" | "repeat" | "repeat-x" | "repeat-y";
  // ── visual effects ──
  filter?: string;
  backdropFilter?: string;
  transition?: string;
  cursor?: string;
  overflow?: "hidden" | "visible" | "auto" | "scroll";
  mixBlendMode?: string;
  // ── divider extensions ──
  dividerStyle?: "solid" | "dashed" | "dotted";
  // ── icon list extensions ──
  bulletColor?: string;
  bulletStyle?: "dot" | "check" | "dash" | "arrow";
  // ── feature grid card extensions ──
  cardBackgroundColor?: string;
  cardBorderColor?: string;
  cardBorderRadius?: string;
  cardBoxShadow?: string;
  // ── button extensions ──
  buttonWidth?: "auto" | "full";
};

export type LyrixElementAdvanced = {
  margin?: LyrixSpacing;
  padding?: LyrixSpacing;
  width?: string;
  widthMode?: "default" | "full" | "inline" | "custom";
  alignSelf?: "auto" | "start" | "center" | "end" | "stretch";
  order?: string;
  orderMode?: "default" | "start" | "end" | "custom";
  sizeMode?: "default" | "none" | "grow" | "shrink" | "custom";
  flexGrow?: string;
  flexShrink?: string;
  position?: "default" | "relative" | "absolute";
  zIndex?: string;
  cssId?: string;
  cssClasses?: string;
};

export type LyrixElement = {
  id: string;
  type: LyrixElementType;
  props: {
    eyebrow?: string;
    title: string;
    body?: string;
    buttonLabel?: string;
    buttonHref?: string;
    imageSrc?: string;
    imageAlt?: string;
    videoUrl?: string;
    height?: string;
    items?: string[];
    layout?: LyrixContainerLayout;
    style?: LyrixElementStyle;
    advanced?: LyrixElementAdvanced;
  };
  children?: LyrixElement[];
};

export type LyrixPageDocument = {
  version: 1;
  title: string;
  path: string;
  elements: LyrixElement[];
  updatedAt: string;
};

type SectionTemplate = {
  type: LyrixElementType;
  label: string;
  description: string;
  props: LyrixElement["props"];
};

export const sectionTemplates: SectionTemplate[] = [
  {
    type: "container",
    label: "Container",
    description: "Empty layout wrapper for nested widgets.",
    props: {
      eyebrow: "Container",
      title: "Container",
      body: "Drop widgets inside this container.",
      layout: {
        containerType: "flex",
        contentWidth: "boxed",
        width: "1140",
        minHeight: "",
        minHeightUnit: "px",
        direction: "column",
        justifyContent: "flex-start",
        alignItems: "stretch",
        gap: "20",
        gapUnit: "px",
        wrap: "nowrap",
        gridOutline: "show",
        columns: "3",
        columnUnit: "fr",
        rows: "2",
        rowUnit: "fr",
        columnGap: "20",
        rowGap: "20",
        gridGapUnit: "px",
        autoFlow: "row",
        gridJustifyItems: "stretch",
        gridAlignItems: "stretch",
        gridJustifyContent: "start",
        gridAlignContent: "start",
      },
    },
  },
  {
    type: "hero",
    label: "Hero",
    description: "Headline, intro copy, and primary action.",
    props: {
      eyebrow: "Lyrix Page",
      title: "Build faster with Lyrix",
      body: "A lightweight visual editing system for modern Next.js sites.",
      buttonLabel: "Get Started",
      buttonHref: "#",
    },
  },
  {
    type: "heading",
    label: "Heading",
    description: "A standalone heading widget.",
    props: {
      eyebrow: "",
      title: "New Heading",
      body: "",
    },
  },
  {
    type: "text",
    label: "Text Editor",
    description: "A focused rich copy block without section chrome.",
    props: {
      eyebrow: "Content",
      title: "Text Editor",
      body: "Write focused page copy here.",
    },
  },
  {
    type: "video",
    label: "Video",
    description: "Responsive video embed for product demos and media.",
    props: {
      title: "Video",
      videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
      height: "320",
    },
  },
  {
    type: "icon-list",
    label: "Icon List",
    description: "Compact list for features, benefits, or steps.",
    props: {
      title: "Icon List",
      items: ["Fast setup", "Responsive editing", "Reusable widgets"],
    },
  },
  {
    type: "button",
    label: "Button",
    description: "A standalone action button.",
    props: {
      title: "Button",
      buttonLabel: "Click Here",
      buttonHref: "#",
    },
  },
  {
    type: "image",
    label: "Image",
    description: "A responsive visual block.",
    props: {
      title: "Image",
      imageSrc: "/window.svg",
      imageAlt: "Lyrix image",
      height: "180",
    },
  },
  {
    type: "divider",
    label: "Divider",
    description: "A simple horizontal separator.",
    props: {
      title: "Divider",
    },
  },
  {
    type: "spacer",
    label: "Spacer",
    description: "Vertical breathing room.",
    props: {
      title: "Spacer",
      height: "24",
    },
  },
  {
    type: "feature-grid",
    label: "Feature Grid",
    description: "Three compact feature points.",
    props: {
      eyebrow: "Features",
      title: "Everything stays modular",
      body: "Use this section for benefits, services, or product highlights.",
      items: ["Fast rendering", "Reusable blocks", "Simple editing"],
    },
  },
  {
    type: "cta",
    label: "CTA",
    description: "A compact action section.",
    props: {
      eyebrow: "Next Step",
      title: "Ready to publish?",
      body: "Save your changes and preview the page before going live.",
      buttonLabel: "Preview Page",
      buttonHref: "#",
    },
  },
];

export function createElementFromTemplate(type: LyrixElementType): LyrixElement {
  const template =
    sectionTemplates.find((section) => section.type === type) ??
    sectionTemplates[0];

  return {
    id: createElementId(),
    type: template.type,
    props: {
      ...template.props,
      items: template.props.items ? [...template.props.items] : undefined,
    },
    children: template.type === "container" ? [] : undefined,
  };
}

export function createDefaultPageDocument({
  title,
  path,
}: {
  title: string;
  path: string;
}): LyrixPageDocument {
  return {
    version: 1,
    title,
    path,
    elements: [
      {
        ...createElementFromTemplate("hero"),
        props: {
          eyebrow: "Lyrix Page",
          title,
          body: "Start building this page with the Lyrix visual editor.",
          buttonLabel: "Edit Content",
          buttonHref: "#",
        },
      },
    ],
    updatedAt: new Date().toISOString(),
  };
}

export function isLyrixPageDocument(
  value: unknown
): value is LyrixPageDocument {
  if (!value || typeof value !== "object") {
    return false;
  }

  const document = value as Partial<LyrixPageDocument>;

  return (
    document.version === 1 &&
    typeof document.title === "string" &&
    typeof document.path === "string" &&
    typeof document.updatedAt === "string" &&
    Array.isArray(document.elements) &&
    document.elements.every(isLyrixElement)
  );
}

function isLyrixElement(value: unknown): value is LyrixElement {
  if (!value || typeof value !== "object") {
    return false;
  }

  const element = value as Partial<LyrixElement>;

  return (
    typeof element.id === "string" &&
    isLyrixElementType(element.type) &&
    Boolean(element.props) &&
    typeof element.props === "object" &&
    typeof element.props.title === "string" &&
    (!element.children ||
      (Array.isArray(element.children) &&
        element.children.every(isLyrixElement)))
  );
}

function isLyrixElementType(value: unknown): value is LyrixElementType {
  return (
    value === "hero" ||
    value === "container" ||
    value === "heading" ||
    value === "image" ||
    value === "button" ||
    value === "divider" ||
    value === "spacer" ||
    value === "text" ||
    value === "video" ||
    value === "icon-list" ||
    value === "cta" ||
    value === "feature-grid"
  );
}

function createElementId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `lx-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}
