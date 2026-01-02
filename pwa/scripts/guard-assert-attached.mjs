// scripts/guard-assert-attached.mjs
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const API_DIR = path.join(ROOT, "app", "api");

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  let files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files = files.concat(walk(full));
    else if (e.name === "route.ts") files.push(full);
  }
  return files;
}

const routes = walk(API_DIR);
let violations = [];

// Routes that are exempt from the assertion
// - create-or-get: Called during attachment process itself
// - medications: Inbound webhook only (receives data, doesn't make SP calls)
const EXEMPT_ROUTES = [
  "app/api/solopractice/patients/create-or-get/route.ts",
  "app/api/patient/medications/route.ts", // Inbound webhook only
];

for (const file of routes) {
  const rel = file.replace(ROOT, "").replaceAll("\\", "/");
  
  // Skip exempt routes
  if (EXEMPT_ROUTES.some(exempt => rel.endsWith(exempt))) {
    continue;
  }

  const content = fs.readFileSync(file, "utf8");

  // Check for actual SP API calls (not just field names or comments)
  const touchesSP =
    content.includes("solopracticeClient") ||
    content.includes("apiClient.") ||
    content.includes("recordMeasurement") ||
    content.includes("sendMessage") ||
    content.includes("scheduleFollowUpAppointment") ||
    (content.includes("SOLOPRACTICE") && (content.includes("fetch") || content.includes("axios")));

  if (touchesSP && !content.includes("assertAttachedPatient")) {
    violations.push(rel);
  }
}

if (violations.length) {
  console.error("❌ SP API routes missing assertAttachedPatient():");
  violations.forEach((v) => console.error(" -", v));
  process.exit(1);
}

console.log("✅ All SP routes assert attachment.");

