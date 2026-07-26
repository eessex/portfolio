-- Step 1: run this now (before deploying the code changes below).
-- Removes `iframe` from the cached JSON every release/event/project page
-- reads through, so it stops referencing the column.
CREATE OR REPLACE FUNCTION build_embed_code_json(e embed_codes)
RETURNS jsonb AS $$
  SELECT jsonb_build_object(
    'id', e.id,
    'src', e.src,
    'type', e.type,
    'host', e.host,
    'contentType', e.content_type,
    'title', e.title,
    'caption', e.caption
  ) || build_write_dates_json(e.created_at, e.updated_at);
$$ LANGUAGE sql IMMUTABLE;

-- Step 2: run this later, once the code changes are deployed (this repo
-- has no migration files, so run it by hand against Neon when you're
-- ready to actually drop the column).
-- ALTER TABLE embed_codes DROP COLUMN iframe;
