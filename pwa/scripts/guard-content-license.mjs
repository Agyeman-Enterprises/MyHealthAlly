// Guard: Enforce content license tier logic
// Rule: If reuse_allowed = true, then license_tier_required !== 'basic'

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, "..");

const CONTENT_ROOT = path.join(ROOT, "content");

function parseMetadata(body) {
  const frontMatterMatch = body.match(/^---\n([\s\S]*?)\n---/);
  if (!frontMatterMatch || !frontMatterMatch[1]) {
    return {
      reuse_allowed: false,
      license_tier_required: "basic",
    };
  }

  const frontMatter = frontMatterMatch[1];
  const metadata = {
    reuse_allowed: false,
    license_tier_required: "basic",
  };

  const reuseMatch = frontMatter.match(/reuse_allowed:\s*(true|false)/);
  if (reuseMatch && reuseMatch[1]) {
    metadata.reuse_allowed = reuseMatch[1] === "true";
  }

  const licenseMatch = frontMatter.match(/license_tier_required:\s*"([^"]+)"/);
  if (licenseMatch && licenseMatch[1]) {
    metadata.license_tier_required = licenseMatch[1];
  }

  return metadata;
}

function checkContentFiles() {
  const violations = [];

  if (!fs.existsSync(CONTENT_ROOT)) {
    console.log("⚠️  Content directory not found, skipping guard check");
    return violations;
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
      const metadata = parseMetadata(body);

      // Rule: If reuse_allowed = true, then license_tier_required !== 'basic'
      if (metadata.reuse_allowed && metadata.license_tier_required === "basic") {
        violations.push({
          file: `${category}/${file}`,
          reason: "reuse_allowed is true but license_tier_required is 'basic'",
        });
      }
    }
  }

  return violations;
}

const violations = checkContentFiles();

if (violations.length > 0) {
  console.error("❌ Content license guard failed:");
  console.error("");
  violations.forEach((v) => {
    console.error(`   ${v.file}: ${v.reason}`);
  });
  console.error("");
  console.error("Rule: If reuse_allowed = true, then license_tier_required must be 'marketing' or 'enterprise'");
  process.exit(1);
}

console.log("✅ Content license guard passed");

