export type LyrixElementType =
  | "container"
  | "heading"
  | "hero"
  | "image"
  | "button"
  | "divider"
  | "spacer"
  | "text"
  | "cta"
  | "feature-grid";

export type LyrixSpacing = {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  unit?: "px" | "%" | "rem";
};

export type LyrixElementStyle = {
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  borderWidth?: string;
  borderRadius?: string;
  boxShadow?: string;
  alignment?: "left" | "center" | "right";
};

export type LyrixElementAdvanced = {
  margin?: LyrixSpacing;
  padding?: LyrixSpacing;
  width?: string;
  alignSelf?: "auto" | "start" | "center" | "end" | "stretch";
  order?: string;
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
    height?: string;
    items?: string[];
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
    label: "Text",
    description: "A simple content section for readable copy.",
    props: {
      eyebrow: "Content",
      title: "A clear section heading",
      body: "Write focused page copy here. Keep the first version simple and fast.",
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
