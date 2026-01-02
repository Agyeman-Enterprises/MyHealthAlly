-- Content Release Registry
-- Authoritative source for content visibility, scheduling, and cross-platform reuse

BEGIN;

CREATE TABLE IF NOT EXISTS public.content_modules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,

  status text NOT NULL DEFAULT 'hidden',
  -- hidden | published | archived

  release_group text NOT NULL DEFAULT 'core',
  -- core | rotation | promo | internal

  publish_at timestamptz NULL,
  unpublish_at timestamptz NULL,

  reuse_allowed boolean NOT NULL DEFAULT false,
  podcast_ready boolean NOT NULL DEFAULT false,
  license_tier_required text NOT NULL DEFAULT 'basic',
  -- basic | marketing | enterprise

  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),

  UNIQUE (slug, category)
);

CREATE INDEX IF NOT EXISTS idx_content_status
  ON public.content_modules (status);

CREATE INDEX IF NOT EXISTS idx_content_publish_at
  ON public.content_modules (publish_at);

CREATE INDEX IF NOT EXISTS idx_content_category
  ON public.content_modules (category);

-- Constraint: status must be one of allowed values
ALTER TABLE public.content_modules
  ADD CONSTRAINT content_modules_status_check
  CHECK (status IN ('hidden', 'published', 'archived'));

-- Constraint: release_group must be one of allowed values
ALTER TABLE public.content_modules
  ADD CONSTRAINT content_modules_release_group_check
  CHECK (release_group IN ('core', 'rotation', 'promo', 'internal'));

-- Constraint: license_tier_required must be one of allowed values
ALTER TABLE public.content_modules
  ADD CONSTRAINT content_modules_license_tier_check
  CHECK (license_tier_required IN ('basic', 'marketing', 'enterprise'));

COMMIT;

