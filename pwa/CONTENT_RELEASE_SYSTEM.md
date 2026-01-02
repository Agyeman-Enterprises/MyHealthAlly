# Content Release System

## Overview

The content release system enables **admin-controlled content publishing** without code redeploys. Content visibility is controlled by a Supabase database table, not markdown frontmatter.

## Architecture

### Three Layers

1. **Markdown Files** (`/content`) - Source of truth for content body
2. **Supabase Registry** (`content_modules` table) - Authoritative source for visibility
3. **Admin UI** (`/admin/content`) - Control interface for releases

### Key Principle

> **Content visibility is data, not code.**
> DB registry overrides file metadata.

## Database Schema

### `content_modules` Table

```sql
CREATE TABLE content_modules (
  id uuid PRIMARY KEY,
  slug text NOT NULL,
  category text NOT NULL,
  title text NOT NULL,
  status text NOT NULL DEFAULT 'hidden', -- hidden | published | archived
  release_group text NOT NULL DEFAULT 'core', -- core | rotation | promo | internal
  publish_at timestamptz NULL,
  unpublish_at timestamptz NULL,
  reuse_allowed boolean NOT NULL DEFAULT false,
  podcast_ready boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (slug, category)
);
```

### Visibility Rules

A module is **visible** if:

```
status = 'published'
AND (publish_at IS NULL OR publish_at <= now())
AND (unpublish_at IS NULL OR unpublish_at > now())
```

## Setup

### 1. Run Migration

```bash
# Apply the migration to create content_modules table
# Migration file: supabase/migrations/006_content_release_registry.sql
```

### 2. Sync Content to DB

```bash
npm run sync:content
```

This script:
- Scans all markdown files in `/content`
- Parses frontmatter metadata
- Upserts records to `content_modules` table
- Preserves existing status if record already exists

### 3. Access Admin UI

Navigate to `/admin/content` (admin role required)

## Admin UI Features

### Content Manager (`/admin/content`)

- View all content modules organized by category
- See current status (published/hidden/archived)
- Toggle status with one click
- View release group, reuse flags, podcast readiness
- See publish dates

### Toggle Status

Click "Publish" or "Unpublish" button to instantly change visibility:
- No code redeploy needed
- Changes take effect immediately
- DB is authoritative source

## Content Loading

### Public Library (`/library`)

- Only shows modules where `status = 'published'` and scheduling conditions are met
- Falls back to file-based loading if DB unavailable
- Uses `getPublishedContent()` which queries DB first

### AI Citation

- `getRelevantLibraryCitations()` - Only uses published modules
- `getHiddenModuleTitles()` - Returns hidden module titles for teaser references
- AI can reference hidden titles but must not quote body text

## Cross-Platform Reuse

### BookADoc2U

Filter modules where:
```
reuse_allowed = true
AND status = published
```

### DrAMD.health Podcast

Filter modules where:
```
podcast_ready = true
AND status = published
```

## Scheduling

### Future Publishing

Set `publish_at` timestamp to schedule future releases:
- Module remains hidden until `publish_at` time
- Automatically becomes visible when time arrives
- No cron jobs needed - checked on each page load

### Auto-Unpublishing

Set `unpublish_at` timestamp to automatically hide content:
- Useful for time-limited promotions
- Content automatically hides after date

## Workflow Examples

### Monthly Content Rotation

1. Admin visits `/admin/content`
2. Unpublishes last month's rotation modules
3. Publishes new rotation modules
4. Changes take effect immediately

### Cross-Marketing Sync

1. Publish module in MHA (`status = 'published'`)
2. Filter by `reuse_allowed = true` for BookADoc2U
3. Filter by `podcast_ready = true` for DrAMD.health
4. All platforms stay in sync automatically

### Scheduled Release

1. Create module with `status = 'hidden'`
2. Set `publish_at = '2025-02-01T00:00:00Z'`
3. Module automatically publishes on Feb 1
4. No manual intervention needed

## API Endpoints

### `POST /api/admin/content/toggle`

Toggles content status between published/hidden.

**Request:**
```json
{
  "id": "uuid",
  "status": "published" | "hidden" | "archived"
}
```

**Response:**
```json
{
  "ok": true
}
```

## Scripts

### `npm run sync:content`

Syncs all markdown files to database:
- Reads frontmatter metadata
- Upserts to `content_modules` table
- Preserves existing DB status (won't overwrite admin changes)
- Safe to run multiple times

## Guard Rules

**No content visibility logic may rely on markdown frontmatter alone.**
**DB registry is authoritative.**

This ensures:
- Admin changes persist
- Scheduling works correctly
- Cross-platform sync is reliable

## Migration Path

### Existing Content (First 10 modules)

- No frontmatter metadata
- Default to `status = 'published'` when synced
- Can be managed via admin UI immediately

### New Content (20 rotation modules)

- Have frontmatter with `status: "hidden"`
- Sync script reads and populates DB
- Admin can publish when ready

## Benefits

✅ **Zero redeploys** - Publish/unpublish without code changes
✅ **Scheduling support** - Future publish dates
✅ **Cross-platform sync** - BookADoc2U + DrAMD.health integration ready
✅ **Admin control** - Simple UI for content managers
✅ **Fallback safety** - Works even if DB unavailable
✅ **Type-safe** - Full TypeScript support

---

*This system enables production-grade content management without CMS complexity.*

