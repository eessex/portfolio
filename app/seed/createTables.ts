'use server'

import postgres from 'postgres'
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

/**
 * Enables the UUID extension for generating default UUIDs in tables.
 * Should be called before creating any table with UUID primary keys.
 */
async function enableUuidExtension () {
  await sql`CREATE EXTENSION IF NOT EXISTS "uuid-ossp";`
}

/**
 * Creates the projects table.
 * Must be created before tables referencing projects via foreign keys.
 */
async function createProjectsTable () {
  await sql`
    CREATE TABLE IF NOT EXISTS projects (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      cover_image_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      title VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
      embed_code_ids UUID[],
      image_ids UUID[],
      link_ids UUID[],
      slug VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
    );
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_slug ON projects(slug);`
}

/**
 * Creates the tags table.
 * Enforces kebab-case format, uniqueness, and prevents case-insensitive duplicates.
 */
async function createTagsTable () {
  await sql`
    CREATE TABLE IF NOT EXISTS tags (
      id VARCHAR(255) PRIMARY KEY CHECK (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
      is_published BOOLEAN DEFAULT true,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `
}

/**
 * Creates the images table.
 * Must be created after projects and tags to set up foreign keys.
 */
async function createImagesTable () {
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
async function createEmbedCodesTable () {
  await sql`
    CREATE TABLE IF NOT EXISTS embed_codes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      caption VARCHAR(255),
      iframe VARCHAR(1000) NOT NULL,
      title VARCHAR(255),
      type VARCHAR(30),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_embed_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      CHECK (type IN ('video', 'audio') OR type IS NULL)
    );
  `
  await sql`CREATE UNIQUE INDEX IF NOT EXISTS idx_embed_codes_iframe ON embed_codes(iframe);`
}

/**
 * Creates the links table.
 * Must be created after projects and tags to set up foreign keys.
 */
async function createLinksTable () {
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
async function createUsersTable () {
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
 * Creates the site_settings table.
 * Must be created after images.
 */
async function createSiteSettingsTable () {
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
async function createAboutTable () {
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
async function createEmailSubscriptionsTable () {
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
 * Creates the venues table.
 * Does not depend on other tables.
 */
async function createVenuesTable () {
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
async function createReleasesTable () {
  await sql`
    CREATE TABLE IF NOT EXISTS releases (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
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
 * Creates the published_edition table.
 * Must be created after releases and projects.
 */
async function createPublishedEditionTable () {
  await sql`
    CREATE TABLE IF NOT EXISTS published_edition (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      release_id UUID NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      publisher VARCHAR(255) NOT NULL,
      format VARCHAR(30) NOT NULL,
      publish_date DATE NOT NULL,
      cover_image_id UUID,
      image_ids UUID[],
      edition_size INT,
      buy_link UUID,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_published_release FOREIGN KEY (release_id) REFERENCES releases(id) ON DELETE CASCADE,
      CONSTRAINT fk_published_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      CHECK (format IN ('LP','2xLP','Cassette','2xCassette','Digital','iOSApp','CD'));
    );
  `
}

/**
 * Creates the events table.
 * Must be created after projects, venues, tags, images, embed_codes, links.
 */
async function createEventsTable () {
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
 * Creates the works table.
 * Must be created after projects and tags.
 */
async function createWorksTable () {
  await sql`
    CREATE TABLE IF NOT EXISTS works (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
      cover_image_id UUID,
      is_published BOOLEAN,
      image_ids UUID[],
      embed_code_ids UUID[],
      link_ids UUID[],
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_work_project FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL,
      CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
    );
  `
}

/**
 * Creates the exhibitions table.
 * Must be created after projects and tags.
 */
async function createExhibitionsTable () {
  await sql`
    CREATE TABLE IF NOT EXISTS exhibitions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      project_id UUID,
      tag_ids UUID[] DEFAULT ARRAY[]::UUID[],
      venue_id UUID NOT NULL,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
      is_published BOOLEAN,
      start_date DATE NOT NULL,
      end_date DATE,
      cover_image_id UUID,
      image_ids UUID[],
      embed_code_ids UUID[],
      link_ids UUID[],
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
    );
  `
}

/**
 * Sets up slug history for tables with slugs.
 * Must be created before any slug update triggers are installed.
 */
async function setupSlugHistory () {
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
async function setupSlugTriggers () {
  const tablesWithSlugs = [
    'projects',
    'releases',
    'events',
    'works',
    'exhibitions',
    'about'
  ]

  for (const table of tablesWithSlugs) {
    await sql`
      DROP TRIGGER IF EXISTS trg_${table}_slug ON ${sql(table)};
      CREATE TRIGGER trg_${table}_slug
      BEFORE UPDATE OF slug ON ${sql(table)}
      FOR EACH ROW EXECUTE FUNCTION save_old_slug();
    `
  }
}

/**
 * Creates all tables in correct order.
 */
export async function createTables () {
  await enableUuidExtension()
  await createProjectsTable()
  await createTagsTable()
  await setupSlugHistory()
  await createUsersTable()
  await createImagesTable()
  await createEmbedCodesTable()
  await createLinksTable()
  await createSiteSettingsTable()
  await createAboutTable()
  await createEmailSubscriptionsTable()
  await createVenuesTable()
  await createReleasesTable()
  await createPublishedEditionTable()
  await createEventsTable()
  await createWorksTable()
  await createExhibitionsTable()
  await setupSlugTriggers()
  console.log('All tables created successfully.')
}
