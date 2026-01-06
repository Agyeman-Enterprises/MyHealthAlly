import fs from "fs";
import path from "path";
import { supabaseService } from "@/lib/supabase/service";

const CONTENT_ROOT = path.join(process.cwd(), "content");

export type ContentModule = {
  slug: string;
  category: string;
  title: string;
  body: string;
  status: string;
  reuse_allowed: boolean;
  podcast_ready: boolean;
  source: string;
  // Optional fields (for backward compatibility)
  release_group?: string;
  license_tier_required?: string;
};

function extractBody(body: string): string {
  // Remove front matter if present
  const withoutFrontMatter = body.replace(/^---\n[\s\S]*?\n---\n/, "");
  return withoutFrontMatter;
}

function extractTitle(body: string): string {
  const titleMatch = body.match(/^#\s(.+)$/m);
  return titleMatch && titleMatch[1] ? titleMatch[1] : "";
}

/**
 * Load published content modules from DB (authoritative source)
 * DB overrides file metadata - this enables admin-controlled releases
 */
export async function loadPublishedContent(): Promise<ContentModule[]> {
  if (!supabaseService) {
    console.warn("Supabase service client not available, falling back to file-based loading");
    return loadAllContentFromFiles({ includeHidden: false });
  }

  const now = new Date().toISOString();
  const nowDate = new Date(now);

  // Load registry (authoritative) - only published modules
  const { data: registry, error } = await supabaseService
    .from("content_modules")
    .select("*")
    .eq("status", "published");

  if (error) {
    console.error("Error loading content registry:", error);
    // Fallback to file-based loading
    return loadAllContentFromFiles({ includeHidden: false });
  }

  type ContentRegistryEntry = {
    slug: string;
    category: string;
    title: string;
    body: string;
    status: string;
    reuse_allowed: boolean;
    podcast_ready: boolean;
    source: string;
    publish_at?: string | null;
    unpublish_at?: string | null;
    release_group?: string | null;
    license_tier_required?: string | null;
  };

  // Filter by publish_at and unpublish_at in memory (PostgREST doesn't support complex OR with timestamps easily)
  const activeRegistry = (registry || []).filter((r): r is ContentRegistryEntry => {
    const entry = r as ContentRegistryEntry;
    const publishAt = entry.publish_at ? new Date(entry.publish_at) : null;
    const unpublishAt = entry.unpublish_at ? new Date(entry.unpublish_at) : null;
    
    const isPublished = !publishAt || publishAt <= nowDate;
    const isNotUnpublished = !unpublishAt || unpublishAt > nowDate;
    
    return isPublished && isNotUnpublished;
  });

  if (!activeRegistry || activeRegistry.length === 0) {
    // No published content in DB, fallback to files
    return loadAllContentFromFiles({ includeHidden: false });
  }

  // Create map for quick lookup
  const registryMap = new Map<string, ContentRegistryEntry>(
    activeRegistry.map((r) => [`${r.category}/${r.slug}`, r])
  );

  // Load markdown files and match with registry
  const modules: ContentModule[] = [];

  if (!fs.existsSync(CONTENT_ROOT)) {
    console.warn(`Content directory not found: ${CONTENT_ROOT}`);
    return modules;
  }

  const categories = fs.readdirSync(CONTENT_ROOT);

  for (const category of categories) {
    const categoryDir = path.join(CONTENT_ROOT, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;

    const files = fs.readdirSync(categoryDir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const slug = file.replace(".md", "");
      const key = `${category}/${slug}`;
      const reg = registryMap.get(key);

      if (!reg) continue; // Not published in DB
      
      // Prefer DB body if available, otherwise load from file
      let body: string;
      if (reg.body) {
        body = reg.body;
      } else {
        // Fallback to file
        const fullPath = path.join(categoryDir, file);
        const fileBody = fs.readFileSync(fullPath, "utf8");
        body = extractBody(fileBody);
      }
      
      const title = reg.title || extractTitle(body) || slug;

      modules.push({
        slug: reg.slug,
        category: reg.category,
        title,
        body,
        status: reg.status,
        reuse_allowed: reg.reuse_allowed,
        podcast_ready: reg.podcast_ready,
        source: reg.source || 'manual',
        // Optional fields
        ...(reg.release_group ? { release_group: reg.release_group } : {}),
        ...(reg.license_tier_required ? { license_tier_required: reg.license_tier_required } : {}),
      });
    }
  }

  return modules;
}

/**
 * Load all content from files (fallback, used when DB not available or for admin preview)
 */
export function loadAllContentFromFiles(options?: { includeHidden?: boolean; adminPreview?: boolean }): ContentModule[] {
  const { includeHidden = false, adminPreview = false } = options || {};
  const modules: ContentModule[] = [];

  if (!fs.existsSync(CONTENT_ROOT)) {
    console.warn(`Content directory not found: ${CONTENT_ROOT}`);
    return modules;
  }

  const categories = fs.readdirSync(CONTENT_ROOT);

  for (const category of categories) {
    const categoryDir = path.join(CONTENT_ROOT, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;

    const files = fs.readdirSync(categoryDir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const fullPath = path.join(categoryDir, file);
      const body = fs.readFileSync(fullPath, "utf8");

      // Parse front matter (for fallback mode)
      const frontMatterMatch = body.match(/^---\n([\s\S]*?)\n---/);
      let status = "published";
      let reuse_allowed = false;
      let podcast_ready = false;
      let release_group: string | undefined;
      let license_tier_required: string | undefined;

      if (frontMatterMatch && frontMatterMatch[1]) {
        const frontMatter = frontMatterMatch[1];
        const statusMatch = frontMatter.match(/status:\s*"([^"]+)"/);
        if (statusMatch && statusMatch[1]) {
          status = statusMatch[1];
        }
        const reuseMatch = frontMatter.match(/reuse_allowed:\s*(true|false)/);
        if (reuseMatch && reuseMatch[1]) {
          reuse_allowed = reuseMatch[1] === "true";
        }
        const podcastMatch = frontMatter.match(/podcast_ready:\s*(true|false)/);
        if (podcastMatch && podcastMatch[1]) {
          podcast_ready = podcastMatch[1] === "true";
        }
        // Optional fields
        const releaseGroupMatch = frontMatter.match(/release_group:\s*"([^"]+)"/);
        if (releaseGroupMatch && releaseGroupMatch[1]) {
          release_group = releaseGroupMatch[1];
        }
        const licenseMatch = frontMatter.match(/license_tier_required:\s*"([^"]+)"/);
        if (licenseMatch && licenseMatch[1]) {
          license_tier_required = licenseMatch[1];
        }
      }

      // Filter by status
      if (status === "hidden" || status === "draft") {
        if (!includeHidden && !adminPreview) {
          continue;
        }
      }

      const bodyContent = extractBody(body);
      const title = extractTitle(bodyContent) || file.replace(".md", "");

      const contentModule: ContentModule = {
        slug: file.replace(".md", ""),
        category,
        title,
        body: bodyContent,
        status,
        reuse_allowed,
        podcast_ready,
        source: 'manual',
      };
      
      // Add optional fields only if they exist
      if (release_group) {
        contentModule.release_group = release_group;
      }
      if (license_tier_required) {
        contentModule.license_tier_required = license_tier_required;
      }
      
      modules.push(contentModule);
    }
  }

  return modules;
}

export function findRelevantContent(
  modules: ContentModule[],
  keywords: string[]
): ContentModule[] {
  return modules.filter((m) =>
    keywords.some((k) =>
      m.body.toLowerCase().includes(k.toLowerCase()) ||
      m.title.toLowerCase().includes(k.toLowerCase())
    )
  );
}

/**
 * Get only published modules (for public display) - uses DB as authoritative
 */
export async function getPublishedContent(): Promise<ContentModule[]> {
  return loadPublishedContent();
}

/**
 * Get hidden modules (for AI teaser references only - title only, no body)
 */
export async function getHiddenModules(): Promise<Array<{ slug: string; category: string; title: string }>> {
  if (!supabaseService) {
    // Fallback to file-based
    const allModules = loadAllContentFromFiles({ includeHidden: true });
    return allModules
      .filter((m) => m.status === "hidden" || m.status === "draft")
      .map((m) => ({
        slug: m.slug,
        category: m.category,
        title: m.title,
      }));
  }

  const { data: registry } = await supabaseService
    .from("content_modules")
    .select("slug, category, title")
    .in("status", ["hidden", "draft"]);

  if (!registry) return [];

  return registry.map((r) => ({
    slug: r.slug,
    category: r.category,
    title: r.title,
  }));
}

// Legacy exports for backward compatibility
export const loadAllContent = loadAllContentFromFiles;
