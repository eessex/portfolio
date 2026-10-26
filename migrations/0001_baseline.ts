/**
 * The schema as of 2026-10-25, before versioned migrations. Frozen:
 * never edit this file (its checksum is verified on every run). New
 * tables and columns go in new migration files.
 *
 * All `IF NOT EXISTS`, so on a database provisioned before migrations
 * existed it changes nothing and is just recorded as applied.
 * Enum-like CHECKs, triggers, SQL functions and the built-in publisher
 * are every-deploy steps (src/seed/every-deploy.ts), not part of it.
 *
 * Must not import app code: that code keeps changing.
 */
type Client = { query: (text: string) => Promise<unknown> }

const statements = [
  `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,

  `CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    contact_info JSONB[],
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
    -- the project rendered at /about; at most one (partial index below)
    is_default_project BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_single_default ON projects (is_default_project) WHERE is_default_project`,

  `CREATE TABLE IF NOT EXISTS tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name VARCHAR(255) NOT NULL CHECK (name ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
    is_published BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_tags_name ON tags(name)`,

  `CREATE TABLE IF NOT EXISTS slug_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    row_id UUID NOT NULL,
    old_slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_slug_history_table_slug ON slug_history(table_name, old_slug)`,
  `CREATE INDEX IF NOT EXISTS idx_slug_history_row ON slug_history(row_id)`,

  `CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name VARCHAR(255) NOT NULL,
    email TEXT NOT NULL
      CONSTRAINT chk_email_format CHECK (email ~* '^[^@]+@[^@]+\\.[^@]+$'),
    password TEXT NOT NULL
      CONSTRAINT chk_password_length CHECK (char_length(password) >= 8),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users(email)`,

  `CREATE TABLE IF NOT EXISTS login_attempts (
    email TEXT PRIMARY KEY,
    failed_count INTEGER DEFAULT 1 NOT NULL,
    last_failed_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS rate_limit_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    bucket TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_rate_limit_events_bucket ON rate_limit_events(bucket, created_at)`,

  `CREATE TABLE IF NOT EXISTS images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
    alt VARCHAR(255),
    aspect DOUBLE PRECISION NOT NULL,
    caption VARCHAR(255),
    type VARCHAR(30),
    title VARCHAR(255),
    url VARCHAR(255) NOT NULL UNIQUE,
    format VARCHAR(10),
    width INTEGER,
    height INTEGER,
    original_filename VARCHAR(255),
    content_hash CHAR(64),
    blur_data_url TEXT,
    variant_version INTEGER,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS embed_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
    caption VARCHAR(255),
    title VARCHAR(255),
    host VARCHAR(30) NOT NULL,
    type VARCHAR(30) NOT NULL,
    src VARCHAR(1000) NOT NULL,
    content_type VARCHAR(40),
    cover_image_id UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS embed_codes_src_type_unique ON embed_codes (src, type)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS embed_codes_cover_image_id_unique ON embed_codes (cover_image_id)`,

  `CREATE TABLE IF NOT EXISTS links (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
    url VARCHAR(255) NOT NULL,
    attribution VARCHAR(255),
    publish_date DATE,
    quotation VARCHAR(255),
    title VARCHAR(255),
    type VARCHAR(30),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_links_url ON links(url)`,

  `CREATE TABLE IF NOT EXISTS site_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    cover_image_id UUID,
    description VARCHAR(255),
    title VARCHAR(255),
    social_link_ids UUID[] NOT NULL DEFAULT ARRAY[]::UUID[],
    is_email_subscribe_enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_site_settings_cover_image FOREIGN KEY (cover_image_id) REFERENCES images(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_site_settings_cover_image ON site_settings(cover_image_id)`,

  `CREATE TABLE IF NOT EXISTS email_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    email VARCHAR(255) NOT NULL,
    exported_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscriptions_email ON email_subscriptions(email)`,

  `CREATE TABLE IF NOT EXISTS venues (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    address VARCHAR(255),
    city VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    state VARCHAR(255),
    country VARCHAR(255),
    url VARCHAR(255),
    timezone TEXT NOT NULL DEFAULT 'America/New_York', -- IANA timezone
    primary_venue_id UUID,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT fk_primary_venue FOREIGN KEY (primary_venue_id)
      REFERENCES venues(id) ON DELETE SET NULL
  )`,
  `CREATE INDEX IF NOT EXISTS idx_venues_name ON venues(name)`,
  `CREATE INDEX IF NOT EXISTS idx_venues_url ON venues(url)`,
  `CREATE INDEX IF NOT EXISTS idx_venues_primary ON venues(primary_venue_id)`,
  `CREATE INDEX IF NOT EXISTS idx_venues_timezone ON venues(timezone)`,

  `CREATE TABLE IF NOT EXISTS releases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    project_id UUID NOT NULL,
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
    CONSTRAINT fk_release_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE RESTRICT,
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_releases_slug_current ON releases(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_releases_release_date ON releases(release_date)`,
  `CREATE INDEX IF NOT EXISTS idx_releases_project_id ON releases(project_id)`,

  `CREATE TABLE IF NOT EXISTS publishers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    name VARCHAR(255) NOT NULL,
    url VARCHAR(255),
    -- optional, so an inline publisher can be created from a name alone
    type VARCHAR(30),
    is_built_in BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_publishers_name ON publishers(name)`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_publishers_single_built_in ON publishers (is_built_in) WHERE is_built_in`,

  // buy_link_id/image_ids/cover_image_id are no longer read or written
  `CREATE TABLE IF NOT EXISTS published_editions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    release_id UUID NOT NULL,
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
    CONSTRAINT fk_published_edition_publisher FOREIGN KEY (publisher_id) REFERENCES publishers(id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_published_editions_publisher ON published_editions(publisher_id)`,

  `CREATE TABLE IF NOT EXISTS events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
    -- deprecated Mongo id, kept for existing data
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
    CONSTRAINT fk_event_venue FOREIGN KEY (venue_id) REFERENCES venues(id),
    CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
  )`,
  `CREATE UNIQUE INDEX IF NOT EXISTS idx_events_slug ON events(slug)`,
  `CREATE INDEX IF NOT EXISTS idx_events_venue ON events(venue_id)`,
  `CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id)`,

  // which row each Mongo document became, for scripts/migrate-mongo.ts
  `CREATE TABLE IF NOT EXISTS legacy_ids (
    source VARCHAR(50) NOT NULL,
    mongo_id TEXT NOT NULL,
    table_name VARCHAR(50) NOT NULL,
    row_id UUID NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    PRIMARY KEY (source, mongo_id)
  )`,
  `CREATE INDEX IF NOT EXISTS idx_legacy_ids_row ON legacy_ids(table_name, row_id)`
]

export default async function baseline(client: Client) {
  for (const statement of statements) await client.query(statement)
}
