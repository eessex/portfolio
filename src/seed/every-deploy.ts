// Run by `pnpm migrate` after pending migrations, on every run: their
// SQL follows the code, so each is idempotent. Deliberately NOT a
// server action ('use server' would expose them as a public endpoint).
import {
  buildLiveSetupCodeNote,
  buildSetupCodeBanner,
  generateSetupCode,
  hashSetupCode,
  SETUP_CODE_TTL_HOURS
} from '@/lib/auth/setup-code'
import {
  embedCodeContentTypes,
  embedCodeHosts,
  embedCodeTypes
} from '@/lib/embed-codes/schemas/db'
import { imageFormats, imageTypes } from '@/lib/images/schemas/db'
import { linkTypes } from '@/lib/links/schemas/db'
import { projectTypes } from '@/lib/projects/schemas'
import { publishedEditionTypes } from '@/lib/published-editions/schemas/db'
import {
  PublisherTypes,
  publisherTypes,
  SELF_RELEASED_PUBLISHER_NAME
} from '@/lib/publishers/schemas/db'
import { releaseTypes } from '@/lib/releases/schemas'
import { pagePaths } from '@/lib/schemas'
import { userTokenPurposes } from '@/lib/users/schemas'

/** The runner's session client (structurally its `MigrationClient`). */
export type EveryDeployClient = {
  query: (
    text: string,
    values?: unknown[]
  ) => Promise<{ rows: Record<string, unknown>[] }>
}

export type EveryDeployOptions = {
  /**
   * Replace a live setup code instead of keeping it. Only
   * `pnpm run setup` sets this: only the code's hash is stored, so a
   * lost one can't be shown again, and whoever runs setup already
   * holds DATABASE_URL, so a new code grants them nothing more.
   */
  isSetupCodeRotated?: boolean
}

/** Columns limited to a code constant's values. */
export const checkedColumns: [
  table: string,
  column: string,
  values: readonly string[]
][] = [
  ['projects', 'type', projectTypes],
  ['images', 'type', imageTypes],
  ['images', 'format', imageFormats],
  ['embed_codes', 'type', embedCodeTypes],
  ['embed_codes', 'host', embedCodeHosts],
  ['embed_codes', 'content_type', embedCodeContentTypes],
  ['links', 'type', linkTypes],
  ['publishers', 'type', publisherTypes],
  ['releases', 'type', releaseTypes],
  ['published_editions', 'format', publishedEditionTypes],
  ['user_tokens', 'purpose', userTokenPurposes]
]

/**
 * (Re)creates each checked column's CHECK from its constant, so adding
 * a value in code reaches the DB on the next deploy. Drops every
 * CHECK on the column first, whatever it's named (older tables' are
 * unnamed or duplicated). One DO block per column, so it's atomic.
 * NULL passes a CHECK, so nullability is left to the column.
 *
 * Skips a column whose only CHECK is already ours with the same
 * values: the rebuild locks the table against reads and rescans it,
 * which most deploys have no reason to do.
 */
async function syncCheckConstraints(client: EveryDeployClient) {
  for (const [table, column, values] of checkedColumns) {
    // code constants, not user input, so safe to inline
    const allowed = values.map((v) => `'${v}'`).join(', ')
    const name = `chk_${table}_${column}`
    await client.query(`
      DO $$
      DECLARE
        con record;
        checks integer := 0;
        is_current boolean := false;
        allowed text[] := ARRAY[${allowed}]::text[];
      BEGIN
        FOR con IN
          SELECT
            pc.conname,
            pc.convalidated,
            cardinality(pc.conkey) AS column_count,
            -- the def's literals: 'a'::text, or 'a'::character varying
            ARRAY(
              SELECT m[1]
              FROM regexp_matches(
                pg_get_constraintdef(pc.oid), '''([^'']*)''', 'g'
              ) AS m
            ) AS literals
          FROM pg_constraint pc
          JOIN pg_attribute a
            ON a.attrelid = pc.conrelid AND a.attnum = ANY (pc.conkey)
          WHERE pc.conrelid = '${table}'::regclass
            AND pc.contype = 'c'
            AND a.attname = '${column}'
        LOOP
          checks := checks + 1;
          is_current := con.conname = '${name}'
            AND con.convalidated
            AND con.column_count = 1
            AND con.literals <@ allowed
            AND allowed <@ con.literals;
        END LOOP;
        IF checks = 1 AND is_current THEN
          RETURN;
        END IF;

        FOR con IN
          SELECT pc.conname
          FROM pg_constraint pc
          JOIN pg_attribute a
            ON a.attrelid = pc.conrelid AND a.attnum = ANY (pc.conkey)
          WHERE pc.conrelid = '${table}'::regclass
            AND pc.contype = 'c'
            AND a.attname = '${column}'
        LOOP
          EXECUTE format('ALTER TABLE ${table} DROP CONSTRAINT %I', con.conname);
        END LOOP;
        ALTER TABLE ${table} ADD CONSTRAINT ${name} CHECK (${column} IN (${allowed}));
      END
      $$;
    `)
  }
}

/**
 * Records a page item's old slug in slug_history. CREATE OR REPLACE, so
 * a re-run updates the function existing triggers already call.
 */
async function setupSlugHistoryFunction(client: EveryDeployClient) {
  await client.query(`
    CREATE OR REPLACE FUNCTION save_old_slug()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.slug IS DISTINCT FROM OLD.slug THEN
        INSERT INTO slug_history(table_name, row_id, old_slug, created_at)
        VALUES (TG_TABLE_NAME, OLD.id, OLD.slug, CURRENT_TIMESTAMP)
        -- a slug given up again (renamed back, or reused by another row)
        -- redirects to whichever row gave it up last
        ON CONFLICT (table_name, old_slug) DO UPDATE
        SET row_id = EXCLUDED.row_id, created_at = EXCLUDED.created_at;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `)
}

/**
 * Installs each page table's slug history trigger. One atomic
 * statement (Postgres 14+), so live edits never hit a gap without it.
 * Skipped when the trigger already matches, since replacing it locks
 * the table against writes. Replacing save_old_slug() needs no new
 * trigger: the trigger calls it by name.
 */
async function setupSlugTriggers(client: EveryDeployClient) {
  for (const table of pagePaths) {
    const trigger = `trg_${table}_slug`
    await client.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1
          FROM pg_trigger t
          JOIN pg_class c ON c.oid = t.tgrelid
          JOIN pg_namespace n ON n.oid = c.relnamespace
          WHERE t.tgrelid = '${table}'::regclass
            AND t.tgname = '${trigger}'
            AND t.tgenabled <> 'D'
            -- the def always schema-qualifies the table
            AND pg_get_triggerdef(t.oid) = format(
              'CREATE TRIGGER %I BEFORE UPDATE OF slug ON %I.%I FOR EACH ROW EXECUTE FUNCTION save_old_slug()',
              '${trigger}', n.nspname, c.relname
            )
        ) THEN
          CREATE OR REPLACE TRIGGER ${trigger}
          BEFORE UPDATE OF slug ON ${table}
          FOR EACH ROW EXECUTE FUNCTION save_old_slug();
        END IF;
      END
      $$;
    `)
  }
}

/**
 * JSONB builder functions for complex nested structures (dates, embed
 * codes, images, links, venues, publishers, published editions,
 * projects). Each is defined after the functions it calls.
 */
async function setupJsonbFunctions(client: EveryDeployClient) {
  await client.query(`
    CREATE OR REPLACE FUNCTION build_write_dates_json(
      created_at TIMESTAMP,
      updated_at TIMESTAMP DEFAULT NULL
    )
    RETURNS jsonb AS $$
      SELECT jsonb_build_object(
        'createdAt', created_at,
        'updatedAt', updated_at
      );
    $$ LANGUAGE sql IMMUTABLE;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION build_embed_code_json(e embed_codes)
    RETURNS jsonb AS $$
      SELECT jsonb_build_object(
        'id', e.id,
        'src', e.src,
        'type', e.type,
        'host', e.host,
        'contentType', e.content_type,
        'title', e.title,
        'caption', e.caption,
        'coverImageId', e.cover_image_id
      ) || build_write_dates_json(e.created_at, e.updated_at);
    $$ LANGUAGE sql IMMUTABLE;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION build_image_json(i images)
    RETURNS jsonb AS $$
      SELECT jsonb_build_object(
        'id', i.id,
        'url', i.url,
        'caption', i.caption,
        'aspect', i.aspect,
        'alt', i.alt,
        'title', i.title,
        'type', i.type,
        'format', i.format,
        'width', i.width,
        'height', i.height,
        'originalFilename', i.original_filename,
        'blurDataUrl', i.blur_data_url,
        'variantVersion', i.variant_version
      ) || build_write_dates_json(i.created_at, i.updated_at);
    $$ LANGUAGE sql IMMUTABLE;
  `)

  // A page item's cover: its cover_image_id, else its first image
  await client.query(`
    CREATE OR REPLACE FUNCTION resolve_cover_image_id(
      cover_image_id UUID,
      image_ids UUID[]
    )
    RETURNS UUID AS $$
      SELECT COALESCE(cover_image_id, image_ids[1]);
    $$ LANGUAGE sql IMMUTABLE;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION build_cover_image_json(
      cover_image_id UUID,
      image_ids UUID[]
    )
    RETURNS jsonb AS $$
      SELECT build_image_json(i)
      FROM images i
      WHERE i.id = resolve_cover_image_id(cover_image_id, image_ids);
    -- STABLE, not IMMUTABLE: it reads images
    $$ LANGUAGE sql STABLE;
  `)

  // a page item's media icons (has_video/has_audio)
  await client.query(`
    CREATE OR REPLACE FUNCTION has_embed_code_type(
      embed_code_ids UUID[],
      embed_code_type TEXT
    )
    RETURNS boolean AS $$
      SELECT EXISTS (
        SELECT 1 FROM embed_codes ec
        WHERE ec.id = ANY(embed_code_ids)
          AND ec.type = embed_code_type
      );
    -- STABLE, not IMMUTABLE: it reads embed_codes
    $$ LANGUAGE sql STABLE;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION build_link_json(l links)
    RETURNS jsonb AS $$
    BEGIN
      RETURN (
        jsonb_build_object(
          'id', l.id,
          'url', l.url,
          'attribution', l.attribution,
          'publishDate', to_char(l.publish_date, 'YYYY-MM-DD"T"HH24:MI:SS.MSZ'),
          'quotation', l.quotation,
          'title', l.title,
          'type', l.type
        )
        || COALESCE(build_write_dates_json(l.created_at, l.updated_at), '{}'::jsonb)
      );
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION build_venue_json(v venues)
    RETURNS jsonb AS $$
      SELECT jsonb_build_object(
        'id', v.id,
        'address', v.address,
        'city', v.city,
        'name', v.name,
        'state', v.state,
        'country', v.country,
        'url', v.url,
        'timezone', v.timezone,
        'primaryVenueId', v.primary_venue_id
      ) || build_write_dates_json(v.created_at, v.updated_at);
    $$ LANGUAGE sql IMMUTABLE;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION build_publisher_json(p publishers)
    RETURNS jsonb AS $$
      SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'url', p.url,
        'type', p.type,
        'isBuiltIn', p.is_built_in
      ) || build_write_dates_json(p.created_at, p.updated_at);
    $$ LANGUAGE sql IMMUTABLE;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION build_published_edition_json(pe published_editions)
    RETURNS jsonb AS $$
    BEGIN
      RETURN (
        jsonb_build_object(
          'id', pe.id,
          'releaseId', pe.release_id,
          'tagIds', pe.tag_ids,
          'publisherId', pe.publisher_id,
          'publisher', (
            SELECT build_publisher_json(p)
            FROM publishers p
            WHERE p.id = pe.publisher_id
          ),
          'format', pe.format,
          'publishDate', pe.publish_date,
          'editionSize', pe.edition_size,
          'catalogNumber', pe.catalog_number
        )
        || COALESCE(build_write_dates_json(pe.created_at, pe.updated_at), '{}'::jsonb)
      );
    END;
    -- STABLE, not IMMUTABLE: it reads publishers
    $$ LANGUAGE plpgsql STABLE;
  `)

  await client.query(`
    CREATE OR REPLACE FUNCTION build_project_json(p projects)
    RETURNS jsonb AS $$
    BEGIN
      RETURN (
        jsonb_build_object(
          'id', p.id,
          'title', p.title,
          'type', p.type,
          'slug', p.slug,
          'startDate', p.start_date,
          'endDate', p.end_date,
          'path', 'projects',
          'isDefaultProject', p.is_default_project,
          'coverImage',
            build_cover_image_json(p.cover_image_id, p.image_ids)
        )
      || COALESCE(build_write_dates_json(p.created_at, p.updated_at), '{}'::jsonb)
    );
    END;
    $$ LANGUAGE plpgsql STABLE;
  `)
}

/**
 * The built-in "Self-released" publisher, listed first in every
 * publisher search and protected from edits/deletes. A partial unique
 * index allows at most one built-in row.
 */
async function seedBuiltInPublisher(client: EveryDeployClient) {
  await client.query(
    `INSERT INTO publishers (name, type, is_built_in)
    SELECT $1, $2, true
    WHERE NOT EXISTS (SELECT 1 FROM publishers WHERE is_built_in)`,
    [SELF_RELEASED_PUBLISHER_NAME, PublisherTypes.recordLabel]
  )
}

/**
 * The instance's own session secret, created once and never rotated
 * here. An AUTH_SECRET env var, when set, takes precedence over it.
 */
async function ensureAuthSecret(client: EveryDeployClient) {
  await client.query(
    `INSERT INTO instance_secrets (name, value)
    VALUES ('auth_secret', encode(gen_random_bytes(32), 'base64'))
    ON CONFLICT (name) DO NOTHING`
  )
}

/**
 * While no user exists, a build creates a setup code so a freshly
 * imported site can be claimed with nothing set by hand: only its
 * hash and an expiry are stored, and the plain code is returned for
 * the build log banner. A code that hasn't expired is kept, so a later
 * build (a preview deploy on the same database, a local setup run)
 * can't invalidate the one already printed; that build just notes when
 * it expires, unless `isSetupCodeRotated` asks for a new one. Once a
 * user exists, the row is gone for good and nothing is printed.
 */
async function ensureSetupCode(
  client: EveryDeployClient,
  { isSetupCodeRotated = false }: EveryDeployOptions = {}
): Promise<string | void> {
  const { rows } = await client.query(
    'SELECT EXISTS (SELECT 1 FROM users) AS "exists"'
  )
  if (rows[0]?.exists) {
    await client.query('DELETE FROM setup_code')
    return
  }

  const { rows: live } = await client.query(
    'SELECT expires_at FROM setup_code WHERE expires_at > now()'
  )
  const expiresAt = live[0]?.expires_at as string | Date | undefined
  if (expiresAt && !isSetupCodeRotated) {
    return buildLiveSetupCodeNote(new Date(expiresAt))
  }

  const code = generateSetupCode()
  await client.query(
    `INSERT INTO setup_code (id, code_hash, expires_at)
    VALUES (true, $1, now() + interval '${SETUP_CODE_TTL_HOURS} hours')
    ON CONFLICT (id) DO UPDATE
    SET code_hash = EXCLUDED.code_hash, expires_at = EXCLUDED.expires_at`,
    [hashSetupCode(code)]
  )
  const banner = buildSetupCodeBanner(code)
  return expiresAt
    ? `  Replaced the earlier setup code; it no longer works.\n${banner}`
    : banner
}

/**
 * Bump whenever any step's SQL changes (every-deploy.test.ts pins the
 * SQL to it). The runner records it and refuses a checkout with a
 * lower one, so an older build can't re-apply stale definitions.
 */
export const EVERY_DEPLOY_REVISION = 5

// In order: triggers call save_old_slug()
export const everyDeploySteps: {
  name: string
  run: (
    client: EveryDeployClient,
    options?: EveryDeployOptions
  ) => Promise<string | void>
}[] = [
  { name: 'syncCheckConstraints', run: syncCheckConstraints },
  { name: 'setupSlugHistoryFunction', run: setupSlugHistoryFunction },
  { name: 'setupSlugTriggers', run: setupSlugTriggers },
  { name: 'setupJsonbFunctions', run: setupJsonbFunctions },
  { name: 'seedBuiltInPublisher', run: seedBuiltInPublisher },
  { name: 'ensureAuthSecret', run: ensureAuthSecret },
  { name: 'ensureSetupCode', run: ensureSetupCode }
]
