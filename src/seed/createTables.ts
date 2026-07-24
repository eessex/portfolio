// Deliberately NOT a server action ('use server' would expose schema
// creation as a public endpoint). Only run from scripts/setup.ts.
import { sql } from '@/lib/db'
import { pagePaths } from '@/lib/schemas'

/**
 * Enables the UUID extension for generating default UUIDs in tables.
 * Should be called before creating any table with UUID primary keys.
 */
async function enableUuidExtension() {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
}

/**
 * Creates the projects table.
 * Must be created before tables referencing projects via foreign keys.
 */
async function createProjectsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      cover_image_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      title VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
      short_description VARCHAR(255),
      embed_code_ids UUID[],
      image_ids UUID[],
      link_ids UUID[],
      slug VARCHAR(255) NOT NULL,
      is_published BOOLEAN,
      start_date DATE,
      end_date DATE,
      type VARCHAR(30),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
      CHECK (type IN ('band', 'collaborative', 'radioShow', 'eventSeries', 'recordLabel') OR type IS NULL)
    );
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);`
}

/**
 * Creates the tags table.
 * `name` enforces kebab-case format and uniqueness.
 */
async function createTagsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      name VARCHAR(255) NOT NULL CHECK (name ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
      is_published BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags(name);`
}

/**
 * Creates the images table.
 * Must be created after projects and tags to set up foreign keys.
 */
async function createImagesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      alt VARCHAR(255),
      aspect DOUBLE PRECISION NOT NULL,
      caption VARCHAR(255),
      is_press BOOLEAN,
      is_hidden_on_about_page BOOLEAN,
      title VARCHAR(255),
      url VARCHAR(255) NOT NULL UNIQUE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_image_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
    );
  `
}

/**
 * Creates the embed_codes table.
 * Must be created after projects and tags to set up foreign keys.
 */
async function createEmbedCodesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS embed_codes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      caption VARCHAR(255),
      iframe VARCHAR(1000),
      title VARCHAR(255),
      host VARCHAR(30) NOT NULL,
      type VARCHAR(30) NOT NULL,
      src VARCHAR(1000) NOT NULL,
      content_type VARCHAR(40),
      created_at TIMESTAMP WITHOUT TIME ZONE
        DEFAULT CURRENT_TIMESTAMP
        NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE
        DEFAULT CURRENT_TIMESTAMP
        NOT NULL
    );
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS embed_codes_src_type_unique
    ON embed_codes (src, type);
  `

  await sql`
    ALTER TABLE embed_codes
    ADD CONSTRAINT chk_embed_codes_type
    CHECK (type IN ('video', 'audio'));
  `

  await sql`
    ALTER TABLE embed_codes
    ADD CONSTRAINT chk_embed_codes_host
    CHECK (
      host IN (
        'bandcamp',
        'mixcloud',
        'soundcloud',
        'spotify',
        'vimeo',
        'youtube',
        'unknown'
      )
    );
  `

  await sql`
    ALTER TABLE embed_codes
    ADD CONSTRAINT chk_embed_codes_content_type
    CHECK (
      content_type IN (
        'dj_set',
        'documentation',
        'interview',
        'film',
        'live_performance',
        'official_audio',
        'official_music_video',
        'other',
        'podcast',
        'radio_show',
        'trailer'
      )
      OR content_type IS NULL
    );
  `
}

/**
 * Creates the links table.
 * Must be created after projects and tags to set up foreign keys.
 */
async function createLinksTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS links (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      url VARCHAR(255) NOT NULL,
      attribution VARCHAR(255),
      publish_date DATE,
      quotation VARCHAR(255),
      title VARCHAR(255),
      type VARCHAR(30),
      is_hidden_on_about_page BOOLEAN,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_link_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      CHECK (type IN ('press','social','buy_link','stream_link') OR type IS NULL)
    );
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_links_url ON links(url);`
}

/**
 * Creates the users table.
 * Does not depend on other tables.
 */
async function createUsersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL
        CONSTRAINT chk_email_format CHECK (email ~* '^[^@]+@[^@]+\\.[^@]+$'),
      password TEXT NOT NULL
        CONSTRAINT chk_password_length CHECK (char_length(password) >= 8),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email);`
}

/**
 * Creates the login_attempts table, which backs the exponential
 * backoff in src/lib/auth/rate-limit.ts.
 * Does not depend on other tables.
 */
async function createLoginAttemptsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS login_attempts (
      email TEXT PRIMARY KEY,
      failed_count INTEGER DEFAULT 1 NOT NULL,
      last_failed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `
}

/**
 * Creates the rate_limit_events table, which backs the sliding-window
 * limiter in src/lib/auth/rate-limit.ts.
 * Does not depend on other tables.
 */
async function createRateLimitEventsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS rate_limit_events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      bucket TEXT NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_rate_limit_events_bucket ON rate_limit_events(bucket, created_at);`
}

/**
 * Creates the site_settings table.
 * Must be created after images.
 */
async function createSiteSettingsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      cover_image_id UUID,
      description VARCHAR(255),
      title VARCHAR(255),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_site_settings_cover_image FOREIGN KEY (cover_image_id) REFERENCES images(id) ON DELETE SET NULL
    );
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_site_settings_cover_image ON site_settings(cover_image_id);`
}

/**
 * Creates the about table.
 * Must be created after images and embed_codes.
 */
async function createAboutTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS about (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      cover_image_id UUID,
      featured_embed_code_id UUID,
      slug VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
      contact_info JSONB[],
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_about_cover_image FOREIGN KEY (cover_image_id) REFERENCES images(id) ON DELETE SET NULL,
      CONSTRAINT fk_about_featured_embed FOREIGN KEY (featured_embed_code_id) REFERENCES embed_codes(id) ON DELETE SET NULL,
      CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
    );
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_about_cover_image ON about(cover_image_id);`
  await sql`CREATE INDEX IF NOT EXISTS idx_about_featured_embed_code ON about(featured_embed_code_id);`
}

/**
 * Creates the email_subscriptions table.
 * Does not depend on other tables.
 */
async function createEmailSubscriptionsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS email_subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      email VARCHAR(255) NOT NULL,
      exported_at TIMESTAMP WITHOUT TIME ZONE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email);`
}

/**
 * Creates the publishers table.
 * Does not depend on other tables.
 */
async function createPublishersTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS publishers (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      name VARCHAR(255) NOT NULL,
      url VARCHAR(255),
      type VARCHAR(30) NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT chk_publishers_type
        CHECK (type IN ('recordLabel', 'publishingHouse', 'museum'))
    );
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_publishers_name ON publishers(name);`
}

/**
 * Creates the venues table.
 * Does not depend on other tables.
 */
async function createVenuesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS venues (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      address VARCHAR(255),
      city VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      state VARCHAR(255),
      country VARCHAR(255),
      url VARCHAR(255),
      timezone TEXT NOT NULL DEFAULT 'America/New_York', -- IANA timezone, e.g. 'America/New_York'
      primary_venue_id UUID,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `

  // Add the self-referential foreign key separately
  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name='venues' AND constraint_name='fk_primary_venue'
      ) THEN
        ALTER TABLE venues
        ADD CONSTRAINT fk_primary_venue FOREIGN KEY (primary_venue_id)
        REFERENCES venues(id)
        ON DELETE SET NULL;
      END IF;
    END
    $$;
  `

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name);`
  await sql`CREATE INDEX IF NOT EXISTS idx_venues_url ON venues(url);`
  await sql`CREATE INDEX IF NOT EXISTS idx_venues_primary ON venues(primary_venue_id);`
  await sql`CREATE INDEX IF NOT EXISTS idx_venues_timezone ON venues(timezone);`
}

/**
 * Creates the releases table.
 * Must be created after projects and tags.
 */
async function createReleasesTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS releases (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
      short_description VARCHAR(255),
      release_date DATE NOT NULL,
      artist VARCHAR(255),
      type VARCHAR(30) NOT NULL,
      is_published BOOLEAN,
      cover_image_id UUID,
      image_ids UUID[],
      embed_code_ids UUID[],
      link_ids UUID[],
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_release_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      CHECK (type IN ('album','ep','soundtrack','feature','compilation','collaborative_release','single') OR type IS NULL),
      CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
    );
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_releases_slug_current ON releases(slug);`
  await sql`CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date);`
}

/**
 * Creates the published_editions table.
 * Must be created after releases, projects, and publishers.
 */
async function createPublishedEditionTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS published_editions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      release_id UUID NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      publisher_id UUID NOT NULL,
      format VARCHAR(30) NOT NULL,
      publish_date DATE NOT NULL,
      cover_image_id UUID,
      image_ids UUID[],
      edition_size INT,
      buy_link_id UUID,
      catalog_number VARCHAR(255),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_published_release FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE,
      CONSTRAINT fk_published_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      CHECK (format IN ('LP','2xLP','Cassette','2xCassette','Digital','iOSApp','CD'))
    );
  `

  await sql`
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE table_name='published_editions'
          AND constraint_name='fk_published_edition_publisher'
      ) THEN
        ALTER TABLE published_editions
        ADD CONSTRAINT fk_published_edition_publisher FOREIGN KEY (publisher_id)
        REFERENCES publishers(id);
      END IF;
    END
    $$;
  `
  await sql`CREATE INDEX IF NOT EXISTS idx_published_editions_publisher ON published_editions(publisher_id);`
}

/**
 * Creates the events table.
 * Must be created after projects, venues, tags, images, embed_codes, links.
 */
async function createEventsTable() {
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      -- Deprecated, use project_id instead
      -- Kept for backwards compatibility with existing data
      -- Will be removed in a future migration
      _id VARCHAR(255),
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      venue_id UUID NOT NULL,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
      short_description VARCHAR(255),
      start_time TIMESTAMP WITH TIME ZONE NOT NULL,
      end_time TIMESTAMP WITH TIME ZONE,
      is_published BOOLEAN,
      cover_image_id UUID,
      image_ids UUID[],
      embed_code_ids UUID[],
      link_ids UUID[],
      ticket_link VARCHAR(255),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_event_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
    );
  `

  // Indexes
  await sql`CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);`
  await sql`CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id);`
}

/**
 * Sets up slug history for tables with slugs.
 * Must be created before any slug update triggers are installed.
 */
async function setupSlugHistory() {
  await sql`
    CREATE TABLE IF NOT EXISTS slug_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      table_name VARCHAR(50) NOT NULL,
      row_id UUID NOT NULL,
      old_slug VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_slug_history_table_slug ON slug_history(table_name, old_slug);`
  await sql`CREATE INDEX IF NOT EXISTS idx_slug_history_row ON slug_history(row_id);`
  await sql`
    CREATE OR REPLACE FUNCTION save_old_slug()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.slug IS DISTINCT FROM OLD.slug THEN
        INSERT INTO slug_history(table_name, row_id, old_slug, created_at)
        VALUES (TG_TABLE_NAME, OLD.id, OLD.slug, CURRENT_TIMESTAMP);
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
  `
}

/**
 * Installs triggers for tables with slugs to record old slugs in slug_history.
 * Must be called after the table and slug_history function are created.
 */
async function setupSlugTriggers() {
  for (const table of pagePaths) {
    const triggerName = `trg_${table}_slug`

    await sql.unsafe(`
      DROP TRIGGER IF EXISTS ${triggerName} ON ${table};
      CREATE TRIGGER ${triggerName}
      BEFORE UPDATE OF slug ON ${table}
      FOR EACH ROW EXECUTE FUNCTION save_old_slug();
    `)
  }
}

/**
 * Sets up JSONB builder functions for complex nested structures
 * Must be called after all relevant tables are created.
 * includes: dates, embed codes, images, links, venues, published editions
 */
async function setupJsonbFunctions() {
  await sql`
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
  `

  await sql`
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
        'iframe', e.iframe
      ) || build_write_dates_json(e.created_at, e.updated_at);
    $$ LANGUAGE sql IMMUTABLE;
  `

  await sql`
    CREATE OR REPLACE FUNCTION build_image_json(i images)
    RETURNS jsonb AS $$
      SELECT jsonb_build_object(
        'id', i.id,
        'url', i.url,
        'caption', i.caption,
        'aspect', i.aspect,
        'alt', i.alt,
        'title', i.title
      ) || build_write_dates_json(i.created_at, i.updated_at);
    $$ LANGUAGE sql IMMUTABLE;
  `

  await sql`
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
          'type', l.type,
          'isHiddenOnAboutPage', l.is_hidden_on_about_page
        ) 
        || COALESCE(build_write_dates_json(l.created_at, l.updated_at), '{}'::jsonb)
      );
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;
  `

  await sql`
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
  `

  await sql`
    CREATE OR REPLACE FUNCTION build_publisher_json(p publishers)
    RETURNS jsonb AS $$
      SELECT jsonb_build_object(
        'id', p.id,
        'name', p.name,
        'url', p.url,
        'type', p.type
      ) || build_write_dates_json(p.created_at, p.updated_at);
    $$ LANGUAGE sql IMMUTABLE;
  `

  await sql`
    CREATE OR REPLACE FUNCTION build_published_edition_json(pe published_editions)
    RETURNS jsonb AS $$
    BEGIN
      RETURN (
        jsonb_build_object(
          'id', pe.id,
          'releaseId', pe.release_id,
          'projectId', pe.project_id,
          'tagIds', pe.tag_ids,
          'publisherId', pe.publisher_id,
          'publisherName', (
            SELECT p.name FROM publishers p
            WHERE p.id = pe.publisher_id
          ),
          'publisher', (
            SELECT build_publisher_json(p)
            FROM publishers p
            WHERE p.id = pe.publisher_id
          ),
          'format', pe.format,
          'publishDate', pe.publish_date,
          'coverImage', (
            CASE
              WHEN COALESCE(pe.cover_image_id, pe.image_ids[1]) IS NOT NULL
              THEN (
                SELECT build_image_json(i)
                FROM images i
                WHERE i.id = COALESCE(pe.cover_image_id, pe.image_ids[1])
              )
            END
          ),
          'images', (
            SELECT COALESCE(jsonb_agg(build_image_json(i)), '[]'::jsonb)
            FROM images i
            WHERE i.id = ANY(pe.image_ids)
              AND i.id != COALESCE(pe.cover_image_id, pe.image_ids[1])
          ),
          'editionSize', pe.edition_size,
          'buyLink', (
            CASE
              WHEN pe.buy_link_id IS NOT NULL
              THEN (
                SELECT build_link_json(l)
                FROM links l
                WHERE l.id = pe.buy_link_id
              )
            END
          ),
          'catalogNumber', pe.catalog_number
        )
        || COALESCE(build_write_dates_json(pe.created_at, pe.updated_at), '{}'::jsonb)
      );
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;
  `

  await sql`
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
          'coverImage', (
            SELECT build_image_json(i)
            FROM images i
            WHERE i.id = COALESCE(p.cover_image_id, p.image_ids[1])
          )
        )
      || COALESCE(build_write_dates_json(p.created_at, p.updated_at), '{}'::jsonb)
    );
    END;
    $$ LANGUAGE plpgsql STABLE;
  `
}

/**
 * Creates all tables in correct order.
 */
export async function createTables() {
  await enableUuidExtension()
  await createProjectsTable()
  await createTagsTable()
  await setupSlugHistory()
  await createUsersTable()
  await createLoginAttemptsTable()
  await createRateLimitEventsTable()
  await createImagesTable()
  await createEmbedCodesTable()
  await createLinksTable()
  await createSiteSettingsTable()
  await createAboutTable()
  await createEmailSubscriptionsTable()
  await createVenuesTable()
  await createReleasesTable()
  await createPublishersTable()
  await createPublishedEditionTable()
  await createEventsTable()
  console.log('All tables created successfully.')

  // post-creation setup
  await setupSlugTriggers()
  await setupJsonbFunctions()
  console.log('Triggers and JSONB functions set up successfully.')
}
