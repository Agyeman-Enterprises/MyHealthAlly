import { NextResponse } from "next/server";
import { supabaseService } from "@/lib/supabase/service";
import { loadPublishedContent } from "@/lib/content/loadContent";

/**
 * Public Content API
 * Serves content modules to external organizations based on license tier
 * 
 * License tiers:
 * - 'basic': Core platform only (internal use in MHA app)
 * - 'marketing': External reuse allowed (websites, newsletters, etc.)
 * - 'enterprise': White-label and contract-only
 */

type LicenseTier = "basic" | "marketing" | "enterprise";

function isFirstPartyBrand(orgId?: string): boolean {
  // First-party brands: Ohimaa, BookADoc2U, MedRx
  // These bypass license checks
  const firstPartyBrands = ["ohimaa", "bookadoc2u", "medrx"];
  return orgId ? firstPartyBrands.includes(orgId.toLowerCase()) : false;
}

function getTierLevel(tier: LicenseTier): number {
  const tierMap: Record<LicenseTier, number> = {
    basic: 1,
    marketing: 2,
    enterprise: 3,
  };
  return tierMap[tier] || 1;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orgId = searchParams.get("orgId");
    const orgLicenseTier = (searchParams.get("licenseTier") || "basic") as LicenseTier;
    const category = searchParams.get("category");
    const slug = searchParams.get("slug");

    // First-party brands bypass license checks
    const isFirstParty = isFirstPartyBrand(orgId || undefined);

    // Load all published content
    const modules = await loadPublishedContent();

    // Filter by category/slug if specified
    let filteredModules = modules;
    if (category) {
      filteredModules = filteredModules.filter((m) => m.category === category);
    }
    if (slug) {
      filteredModules = filteredModules.filter((m) => m.slug === slug);
    }

    // Apply license tier filtering (unless first-party)
    // Note: license_tier_required is now optional, default to 'basic' if not set
    if (!isFirstParty) {
      const orgTierLevel = getTierLevel(orgLicenseTier);
      filteredModules = filteredModules.filter((module) => {
        const moduleTier = (module.license_tier_required || 'basic') as LicenseTier;
        const moduleTierLevel = getTierLevel(moduleTier);
        // Organization must have license tier >= module requirement
        return orgTierLevel >= moduleTierLevel;
      });
    }

    // Return filtered modules (without body for list requests, with body for single requests)
    if (slug && filteredModules.length === 1) {
      // Single module request - return full body
      const module = filteredModules[0];
      if (!module) {
        return NextResponse.json({ error: "Module not found" }, { status: 404 });
      }
      return NextResponse.json({
        module,
        licenseTier: module.license_tier_required,
      });
    }

    // List request - return metadata only (no body)
    const metadataOnly = filteredModules.map((m) => ({
      slug: m.slug,
      category: m.category,
      title: m.title,
      license_tier_required: m.license_tier_required,
      release_group: m.release_group,
      reuse_allowed: m.reuse_allowed,
      podcast_ready: m.podcast_ready,
    }));

    return NextResponse.json({
      modules: metadataOnly,
      count: metadataOnly.length,
      orgLicenseTier,
      isFirstParty,
    });
  } catch (error) {
    console.error("Error serving public content:", error);
    return NextResponse.json(
      { error: "Failed to load content" },
      { status: 500 }
    );
  }
}

