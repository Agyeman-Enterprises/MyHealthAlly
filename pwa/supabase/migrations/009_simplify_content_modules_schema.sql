-- Simplify content_modules schema
-- Remove optional fields: release_group, publish_at, unpublish_at, license_tier_required
-- Keep body and source as required fields

BEGIN;

-- Make body NOT NULL (should be populated by sync script)
ALTER TABLE public.content_modules
  ALTER COLUMN body SET NOT NULL;

-- Make removed fields nullable (for backward compatibility during transition)
-- These can be dropped later if not needed
ALTER TABLE public.content_modules
  ALTER COLUMN release_group DROP NOT NULL,
  ALTER COLUMN publish_at DROP NOT NULL,
  ALTER COLUMN unpublish_at DROP NOT NULL,
  ALTER COLUMN license_tier_required DROP NOT NULL;

-- Ensure source has default
ALTER TABLE public.content_modules
  ALTER COLUMN source SET DEFAULT 'manual';

-- Update any NULL bodies from existing records (if any)
-- This assumes markdown files exist - sync script should handle this
UPDATE public.content_modules
SET body = ''
WHERE body IS NULL;

-- Now make body NOT NULL
ALTER TABLE public.content_modules
  ALTER COLUMN body SET NOT NULL;

COMMIT;

