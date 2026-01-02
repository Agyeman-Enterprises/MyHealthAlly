// Sync content modules from markdown files to Supabase DB
// Run this once to populate the content_modules table from existing markdown files

import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

// Load env vars
import dotenv from "dotenv";
dotenv.config({ path: path.join(ROOT, ".env.local") });

const CONTENT_ROOT = path.join(ROOT, "content");

function parseMetadata(body) {
  const frontMatterMatch = body.match(/^---\n([\s\S]*?)\n---/);
  if (!frontMatterMatch || !frontMatterMatch[1]) {
    return {
      status: "published",
      reuse_allowed: false,
      podcast_ready: false,
    };
  }

  const frontMatter = frontMatterMatch[1];
  const metadata = {
    status: "published",
    reuse_allowed: false,
    podcast_ready: false,
  };

  const statusMatch = frontMatter.match(/status:\s*"([^"]+)"/);
  if (statusMatch && statusMatch[1]) {
    metadata.status = statusMatch[1];
  }

  const releaseGroupMatch = frontMatter.match(/release_group:\s*"([^"]+)"/);
  if (releaseGroupMatch && releaseGroupMatch[1]) {
    metadata.release_group = releaseGroupMatch[1];
  }

  const reuseMatch = frontMatter.match(/reuse_allowed:\s*(true|false)/);
  if (reuseMatch && reuseMatch[1]) {
    metadata.reuse_allowed = reuseMatch[1] === "true";
  }

  const podcastMatch = frontMatter.match(/podcast_ready:\s*(true|false)/);
  if (podcastMatch && podcastMatch[1]) {
    metadata.podcast_ready = podcastMatch[1] === "true";
  }

  const licenseMatch = frontMatter.match(/license_tier_required:\s*"([^"]+)"/);
  if (licenseMatch && licenseMatch[1]) {
    metadata.license_tier_required = licenseMatch[1];
  }

  return metadata;
}

function extractTitle(body) {
  const titleMatch = body.match(/^#\s(.+)$/m);
  return titleMatch && titleMatch[1] ? titleMatch[1] : "";
}

async function syncContent() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error("❌ Missing Supabase credentials:");
    console.error("   Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local");
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  console.log("📚 Scanning markdown files...");

  const modules = [];

  if (!fs.existsSync(CONTENT_ROOT)) {
    console.error(`❌ Content directory not found: ${CONTENT_ROOT}`);
    process.exit(1);
  }

  const categories = fs.readdirSync(CONTENT_ROOT);

  for (const category of categories) {
    const categoryDir = path.join(CONTENT_ROOT, category);
    if (!fs.statSync(categoryDir).isDirectory()) continue;

    const files = fs.readdirSync(categoryDir);
    for (const file of files) {
      if (!file.endsWith(".md")) continue;

      const slug = file.replace(".md", "");
      const fullPath = path.join(categoryDir, file);
      const body = fs.readFileSync(fullPath, "utf8");

      const metadata = parseMetadata(body);
      const title = extractTitle(body) || slug;
      
      // Extract body content (remove frontmatter)
      const bodyContent = body.replace(/^---\n[\s\S]*?\n---\n/, "");

      modules.push({
        slug,
        category,
        title,
        body: bodyContent,
        status: metadata.status,
        release_group: metadata.release_group,
        reuse_allowed: metadata.reuse_allowed,
        podcast_ready: metadata.podcast_ready,
        license_tier_required: metadata.license_tier_required,
        source: 'manual', // Markdown files are manually created
      });
    }
  }

  console.log(`✅ Found ${modules.length} content modules`);

  // Upsert to DB
  console.log("💾 Syncing to database...");

  for (const module of modules) {
    const { error } = await supabase
      .from("content_modules")
      .upsert(
        {
          slug: module.slug,
          category: module.category,
          title: module.title,
          body: module.body,
          status: module.status,
          release_group: module.release_group,
          reuse_allowed: module.reuse_allowed,
          podcast_ready: module.podcast_ready,
          license_tier_required: module.license_tier_required,
          source: module.source,
        },
        {
          onConflict: "slug,category",
        }
      );

    if (error) {
      console.error(`❌ Error syncing ${module.category}/${module.slug}:`, error.message);
    } else {
      console.log(`   ✓ ${module.category}/${module.slug} (${module.status})`);
    }
  }

  console.log("✅ Content sync complete!");
  console.log(`\n📊 Summary:`);
  const published = modules.filter((m) => m.status === "published").length;
  const hidden = modules.filter((m) => m.status === "hidden").length;
  console.log(`   Published: ${published}`);
  console.log(`   Hidden: ${hidden}`);
  console.log(`\n💡 Next steps:`);
  console.log(`   1. Visit /admin/content to manage releases`);
  console.log(`   2. Toggle status to publish/unpublish without redeploy`);
}

syncContent().catch((error) => {
  console.error("❌ Sync failed:", error);
  process.exit(1);
});

