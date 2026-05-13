import { mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import path from "path";
import {
  createDefaultBlockDocument,
  isLyrixBlockDocument,
  LyrixBlockCategory,
  LyrixBlockDocument,
} from "@/lib/lyrix-document";

type CreateComponentInput = {
  name: string;
  slug?: string;
  category?: LyrixBlockCategory;
};

export type LyrixComponent = {
  name: string;
  slug: string;
  category: LyrixBlockCategory;
  filePath: string;
};

const RESERVED_COMPONENT_SLUGS = new Set([
  "node_modules",
  ".next",
  "app",
  "components",
  "lib",
  "public",
]);

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function toComponentName(slug: string) {
  const name = slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join("");

  return `Lx${name || "Generated"}Block`;
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}

function validateComponentInput(input: CreateComponentInput) {
  const name = input.name.trim();
  const slug = slugify(input.slug || name);

  if (name.length < 2 || name.length > 80) {
    throw new Error("Component name must be between 2 and 80 characters.");
  }

  if (!slug || slug.length > 80) {
    throw new Error("Component slug must be between 1 and 80 characters.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Component slug may only contain lowercase letters, numbers, and hyphens.");
  }

  if (RESERVED_COMPONENT_SLUGS.has(slug)) {
    throw new Error("That component slug is reserved.");
  }

  return { name, slug };
}

function createComponentTemplate(name: string, slug: string) {
  const componentName = toComponentName(slug);
  const componentTitle = JSON.stringify(name);

  return `const componentTitle = ${componentTitle};

export default function ${componentName}() {
  return (
    <section className="rounded-lg border border-border bg-card p-6">
      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
        Lyrix Block
      </p>
      <h2 className="mt-3 text-2xl font-semibold tracking-normal">
        {componentTitle}
      </h2>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">
        Edit this reusable block inside lx-components/${slug}/component.tsx.
      </p>
    </section>
  );
}
`;
}

export class LyrixComponentService {
  private readonly componentsDirectory: string;

  constructor(componentsDirectory = path.join(process.cwd(), "lx-components")) {
    this.componentsDirectory = componentsDirectory;
  }

  async createComponent(input: CreateComponentInput): Promise<LyrixComponent> {
    const { name, slug } = validateComponentInput(input);
    const category: LyrixBlockCategory = input.category ?? "other";
    const componentDirectory = path.join(this.componentsDirectory, slug);
    const componentFilePath = path.join(componentDirectory, "component.tsx");
    const blockDocPath = path.join(componentDirectory, "lyrix-block.json");

    await this.assertPathInsideComponents(componentDirectory);

    if (await this.pathExists(componentFilePath)) {
      throw new Error("A component with that slug already exists.");
    }

    await mkdir(componentDirectory, { recursive: false });

    try {
      await writeFile(componentFilePath, createComponentTemplate(name, slug), {
        encoding: "utf8",
        flag: "wx",
      });

      const blockDoc = createDefaultBlockDocument({ name, slug, category });
      await writeFile(
        blockDocPath,
        `${JSON.stringify(blockDoc, null, 2)}\n`,
        { encoding: "utf8", flag: "wx" }
      );
    } catch (error) {
      if (await this.pathExists(componentFilePath)) {
        throw new Error("A component with that slug already exists.");
      }

      throw error;
    }

    return { name, slug, category, filePath: componentFilePath };
  }

  async deleteComponent(slugInput: string) {
    const slug = slugify(slugInput);

    if (!slug) {
      throw new Error("Choose a component to delete.");
    }

    if (RESERVED_COMPONENT_SLUGS.has(slug)) {
      throw new Error("That component slug is reserved.");
    }

    const componentDirectory = path.join(this.componentsDirectory, slug);
    const componentFilePath = path.join(componentDirectory, "component.tsx");

    await this.assertPathInsideComponents(componentDirectory);

    if (!(await this.pathExists(componentFilePath))) {
      throw new Error("A component with that slug does not exist.");
    }

    await rm(componentDirectory, { recursive: true });

    return { slug };
  }

  async listComponents(): Promise<LyrixComponent[]> {
    if (!(await this.pathExists(this.componentsDirectory))) {
      await mkdir(this.componentsDirectory, { recursive: true });
      return [];
    }

    const entries = await readdir(this.componentsDirectory, { withFileTypes: true });
    const components: LyrixComponent[] = [];

    for (const entry of entries) {
      if (!entry.isDirectory() || RESERVED_COMPONENT_SLUGS.has(entry.name)) {
        continue;
      }

      const componentFilePath = path.join(
        this.componentsDirectory,
        entry.name,
        "component.tsx"
      );

      if (!(await this.pathExists(componentFilePath))) {
        continue;
      }

      const blockDoc = await this.readBlockDocMeta(entry.name);

      components.push({
        name: blockDoc?.name ?? titleFromSlug(entry.name),
        slug: entry.name,
        category: blockDoc?.category ?? "other",
        filePath: componentFilePath,
      });
    }

    return components.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getBlockDocument(slug: string): Promise<LyrixBlockDocument> {
    const cleanSlug = slugify(slug);
    const blockDocPath = this.resolveBlockDocPath(cleanSlug);

    await this.assertPathInsideComponents(blockDocPath);

    if (await this.pathExists(blockDocPath)) {
      const source = await readFile(blockDocPath, "utf8");
      const parsed = JSON.parse(source) as unknown;

      if (isLyrixBlockDocument(parsed)) {
        return parsed;
      }
    }

    return createDefaultBlockDocument({
      name: titleFromSlug(cleanSlug),
      slug: cleanSlug,
      category: "other",
    });
  }

  async saveBlockDocument(slug: string, document: LyrixBlockDocument): Promise<LyrixBlockDocument> {
    const cleanSlug = slugify(slug);
    const blockDocPath = this.resolveBlockDocPath(cleanSlug);

    await this.assertPathInsideComponents(blockDocPath);

    if (!isLyrixBlockDocument(document)) {
      throw new Error("Invalid Lyrix block document.");
    }

    const next: LyrixBlockDocument = {
      ...document,
      slug: cleanSlug,
      updatedAt: new Date().toISOString(),
    };

    await writeFile(blockDocPath, `${JSON.stringify(next, null, 2)}\n`, {
      encoding: "utf8",
    });

    return next;
  }

  private resolveBlockDocPath(slug: string) {
    return path.join(this.componentsDirectory, slug, "lyrix-block.json");
  }

  private async readBlockDocMeta(
    slug: string
  ): Promise<Pick<LyrixBlockDocument, "name" | "category"> | null> {
    const blockDocPath = this.resolveBlockDocPath(slug);

    try {
      const source = await readFile(blockDocPath, "utf8");
      const parsed = JSON.parse(source) as unknown;

      if (
        parsed &&
        typeof parsed === "object" &&
        "name" in parsed &&
        "category" in parsed &&
        typeof (parsed as { name: unknown }).name === "string" &&
        typeof (parsed as { category: unknown }).category === "string"
      ) {
        return {
          name: (parsed as { name: string }).name,
          category: (parsed as { category: LyrixBlockCategory }).category,
        };
      }
    } catch {
      // Fall back to slug-derived title
    }

    return null;
  }

  private async pathExists(targetPath: string) {
    try {
      await stat(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  private async assertPathInsideComponents(targetPath: string) {
    const relativePath = path.relative(this.componentsDirectory, targetPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error("Invalid component path.");
    }
  }
}
