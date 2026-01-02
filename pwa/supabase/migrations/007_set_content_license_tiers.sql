-- Set license tiers for existing content based on category
-- Tier 2 (marketing): nutrition, movement
-- Tier 3 (enterprise): concierge
-- Tier 1 (basic): everything else (default)

BEGIN;

-- Tier 2: Marketing License
UPDATE content_modules
SET license_tier_required = 'marketing'
WHERE category IN ('nutrition', 'movement')
  AND license_tier_required = 'basic';

-- Tier 3: Enterprise License
UPDATE content_modules
SET license_tier_required = 'enterprise'
WHERE category = 'concierge'
  AND license_tier_required = 'basic';

-- Tier 1 remains default ('basic') for:
-- - health-navigation
-- - lifestyle
-- - any other categories

COMMIT;

