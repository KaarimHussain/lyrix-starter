import { mkdir, readdir, readFile, rm, stat, writeFile } from "fs/promises";
import path from "path";
import {
  createDefaultPageDocument,
  isLyrixBlockDocument,
  isLyrixPageDocument,
  LyrixElement,
  LyrixPageDocument,
} from "@/lib/lyrix-document";

type CreatePageInput = {
  name: string;
  slug?: string;
};

type CreatePageResult = {
  name: string;
  slug: string;
  routePath: string;
  filePath: string;
};

export type LyrixPage = {
  name: string;
  slug: string;
  routePath: string;
  filePath: string;
};

const RESERVED_PAGE_SLUGS = new Set([
  "api",
  "lx-admin",
  "_next",
  "static",
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

  return `${name || "Generated"}Page`;
}

function validatePageInput(input: CreatePageInput) {
  const name = input.name.trim();
  const slug = slugify(input.slug || name);

  if (name.length < 2 || name.length > 80) {
    throw new Error("Page name must be between 2 and 80 characters.");
  }

  if (!slug || slug.length > 80) {
    throw new Error("Page slug must be between 1 and 80 characters.");
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new Error("Page slug may only contain lowercase letters, numbers, and hyphens.");
  }

  if (RESERVED_PAGE_SLUGS.has(slug)) {
    throw new Error("That page slug is reserved.");
  }

  return { name, slug };
}

function createPageTemplate(name: string, slug: string) {
  const componentName = toComponentName(slug);
  const pageTitle = JSON.stringify(name);
  const routePath = JSON.stringify(`/${slug}`);

  return `import { LyrixRenderer } from "@/components/lyrix/lyrix-renderer";
import { LyrixPageService } from "@/lib/lyrix-page-service";

const pageTitle = ${pageTitle};
const routePath = ${routePath};

export const metadata = {
  title: pageTitle,
};

export default async function ${componentName}() {
  const pageService = new LyrixPageService();
  const document = await pageService.getPageDocument(routePath);

  return <LyrixRenderer document={document} />;
}
`;
}

export class LyrixPageService {
  private readonly appDirectory: string;

  constructor(appDirectory = path.join(process.cwd(), "app")) {
    this.appDirectory = appDirectory;
  }

  async createPage(input: CreatePageInput): Promise<CreatePageResult> {
    const { name, slug } = validatePageInput(input);
    const pageDirectory = path.join(this.appDirectory, slug);
    const pageFilePath = path.join(pageDirectory, "page.tsx");

    await this.assertPathInsideApp(pageDirectory);

    if (await this.pathExists(pageFilePath)) {
      throw new Error("A page with that slug already exists.");
    }

    await mkdir(pageDirectory, { recursive: false });

    try {
      await writeFile(pageFilePath, createPageTemplate(name, slug), {
        encoding: "utf8",
        flag: "wx",
      });
    } catch (error) {
      if (await this.pathExists(pageFilePath)) {
        throw new Error("A page with that slug already exists.");
      }

      throw error;
    }

    return {
      name,
      slug,
      routePath: `/${slug}`,
      filePath: pageFilePath,
    };
  }

  async deletePage(slugInput: string) {
    const slug = slugify(slugInput);

    if (!slug) {
      throw new Error("The home page cannot be deleted.");
    }

    if (RESERVED_PAGE_SLUGS.has(slug)) {
      throw new Error("That page slug is reserved.");
    }

    const pageDirectory = path.join(this.appDirectory, slug);
    const pageFilePath = path.join(pageDirectory, "page.tsx");

    await this.assertPathInsideApp(pageDirectory);

    if (!(await this.pathExists(pageFilePath))) {
      throw new Error("A page with that slug does not exist.");
    }

    await rm(pageDirectory, { recursive: true });

    return {
      slug,
      routePath: `/${slug}`,
    };
  }

  async listPages(): Promise<LyrixPage[]> {
    const pages: LyrixPage[] = [];
    const homePagePath = path.join(this.appDirectory, "page.tsx");

    if (await this.pathExists(homePagePath)) {
      pages.push({
        name: await this.readPageTitle(homePagePath, "Home"),
        slug: "",
        routePath: "/",
        filePath: homePagePath,
      });
    }

    const entries = await readdir(this.appDirectory, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory() || RESERVED_PAGE_SLUGS.has(entry.name)) {
        continue;
      }

      const pageFilePath = path.join(this.appDirectory, entry.name, "page.tsx");

      if (!(await this.pathExists(pageFilePath))) {
        continue;
      }

      pages.push({
        name: await this.readPageTitle(pageFilePath, titleFromSlug(entry.name)),
        slug: entry.name,
        routePath: `/${entry.name}`,
        filePath: pageFilePath,
      });
    }

    return pages.sort((pageA, pageB) => {
      if (pageA.routePath === "/") {
        return -1;
      }

      if (pageB.routePath === "/") {
        return 1;
      }

      return pageA.name.localeCompare(pageB.name);
    });
  }

  async getRawPageDocument(routePath: string): Promise<LyrixPageDocument> {
    const page = await this.getPageByRoutePath(routePath);
    const documentFilePath = await this.getPageDocumentFilePath(page.slug);

    if (await this.pathExists(documentFilePath)) {
      const source = await readFile(documentFilePath, "utf8");
      const parsed = JSON.parse(source) as unknown;

      if (isLyrixPageDocument(parsed)) {
        return parsed;
      }
    }

    return createDefaultPageDocument({
      title: page.name,
      path: page.routePath,
    });
  }

  async getPageDocument(routePath: string): Promise<LyrixPageDocument> {
    const raw = await this.getRawPageDocument(routePath);
    return {
      ...raw,
      elements: await this.resolveBlockRefs(raw.elements),
    };
  }

  private async resolveBlockRefs(elements: LyrixElement[]): Promise<LyrixElement[]> {
    const result: LyrixElement[] = [];

    for (const element of elements) {
      if (element.type === "block-ref") {
        const blockElements = await this.loadBlockElements(element.props.blockSlug ?? "");
        result.push(...blockElements);
      } else if (element.children?.length) {
        result.push({ ...element, children: await this.resolveBlockRefs(element.children) });
      } else {
        result.push(element);
      }
    }

    return result;
  }

  private async loadBlockElements(slug: string): Promise<LyrixElement[]> {
    if (!slug) return [];

    try {
      const blockPath = path.join(process.cwd(), "lx-components", slug, "lyrix-block.json");
      const source = await readFile(blockPath, "utf8");
      const parsed = JSON.parse(source) as unknown;
      if (!isLyrixBlockDocument(parsed)) return [];
      return parsed.elements;
    } catch {
      return [];
    }
  }

  async savePageDocument(routePath: string, document: LyrixPageDocument) {
    const page = await this.getPageByRoutePath(routePath);
    const documentFilePath = await this.getPageDocumentFilePath(page.slug);

    if (!isLyrixPageDocument(document)) {
      throw new Error("Invalid Lyrix page document.");
    }

    const nextDocument: LyrixPageDocument = {
      ...document,
      title: page.name,
      path: page.routePath,
      updatedAt: new Date().toISOString(),
    };

    await writeFile(documentFilePath, `${JSON.stringify(nextDocument, null, 2)}\n`, {
      encoding: "utf8",
    });

    return nextDocument;
  }

  private async pathExists(targetPath: string) {
    try {
      await stat(targetPath);
      return true;
    } catch {
      return false;
    }
  }

  private async assertPathInsideApp(targetPath: string) {
    const relativePath = path.relative(this.appDirectory, targetPath);

    if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) {
      throw new Error("Invalid page path.");
    }
  }

  private async getPageByRoutePath(routePath: string) {
    const normalizedPath = normalizeRoutePath(routePath);
    const pages = await this.listPages();
    const page = pages.find((candidate) => candidate.routePath === normalizedPath);

    if (!page) {
      throw new Error("A page with that path does not exist.");
    }

    return page;
  }

  private async getPageDocumentFilePath(slug: string) {
    const pageDirectory = slug
      ? path.join(this.appDirectory, slug)
      : this.appDirectory;
    const documentFilePath = path.join(pageDirectory, "lyrix-page.json");

    await this.assertPathInsideApp(documentFilePath);

    return documentFilePath;
  }

  private async readPageTitle(pageFilePath: string, fallback: string) {
    const source = await readFile(pageFilePath, "utf8").catch(() => "");
    const match = source.match(/const\s+pageTitle\s*=\s*["'`]([^"'`]+)["'`]/);

    return match?.[1] || fallback;
  }
}

function normalizeRoutePath(routePath: string) {
  const pathName = routePath.trim();

  if (!pathName || pathName === "/") {
    return "/";
  }

  return `/${pathName.replace(/^\/+|\/+$/g, "")}`;
}

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ");
}
