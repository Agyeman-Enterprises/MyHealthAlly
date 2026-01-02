-- Add body and source columns to content_modules
-- body: Store content body in DB (not just markdown files)
-- source: Track content origin (manual | voice_memo | imported)

BEGIN;

-- Add body column (nullable initially, will be populated from markdown files)
ALTER TABLE public.content_modules
  ADD COLUMN IF NOT EXISTS body text NULL;

-- Add source column with default
ALTER TABLE public.content_modules
  ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'manual';

-- Constraint: source must be one of allowed values
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'content_modules_source_check'
  ) THEN
    ALTER TABLE public.content_modules
      ADD CONSTRAINT content_modules_source_check
      CHECK (source IN ('manual', 'voice_memo', 'imported'));
  END IF;
END $$;

-- Update existing records: set source to 'manual' if NULL
UPDATE public.content_modules
SET source = 'manual'
WHERE source IS NULL;

-- Make body NOT NULL after ensuring all records have it
-- (This will be populated by sync script or migration)
-- For now, allow NULL to enable gradual migration

COMMIT;

