'use server'

import postgres from 'postgres'
const sql = postgres(process.env.POSTGRES_URL!, { ssl: 'require' })

// table statements must be run sequentially!

async function enableUuidExtension() {
  await sql`
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
  `
}

async function createImagesTable() {
  await enableUuidExtension()
  await sql`
    CREATE TABLE IF NOT EXISTS images (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      aspect NUMERIC NOT NULL,
      caption VARCHAR(255),
      url VARCHAR(255) NOT NULL UNIQUE,
      is_press BOOLEAN,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      title VARCHAR(255),
      is_hidden_on_about_page BOOLEAN
    );
  `
}

async function createSiteSettingsTable() {
  await enableUuidExtension()
  await sql`
    CREATE TABLE IF NOT EXISTS site_settings (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      cover_image_id UUID,
      description VARCHAR(255),
      title VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_site_settings_cover_image
        FOREIGN KEY (cover_image_id)
        REFERENCES images(id)
        ON DELETE SET NULL
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS idx_site_settings_cover_image
      ON site_settings (cover_image_id);
  `
}

async function createAboutTable() {
  await enableUuidExtension()
  await sql`
    CREATE TABLE IF NOT EXISTS about (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      cover_image_id UUID,
      featured_embed_code_id UUID,
      description VARCHAR(5000),
      slug VARCHAR(255) NOT NULL,
      title VARCHAR(255) NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_about_cover_image
        FOREIGN KEY (cover_image_id)
        REFERENCES images(id)
        ON DELETE SET NULL,
      CONSTRAINT fk_about_featured_embed
        FOREIGN KEY (featured_embed_code_id)
        REFERENCES embed_codes(id)
        ON DELETE SET NULL
    );
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_about_cover_image
      ON about (cover_image_id);
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_about_featured_embed_code
      ON about (featured_embed_code_id);
  `
}

// 5.
async function createUsersTable() {
  await enableUuidExtension()
  await sql`
    CREATE TABLE IF NOT EXISTS users (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      name VARCHAR(255) NOT NULL,
      email TEXT NOT NULL CHECK (char_length(email) >= 5),
      password TEXT NOT NULL CHECK (char_length(password) >= 8),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
      ON users (email);
  `
}

async function createLinksTable() {
  await enableUuidExtension();
  await sql`
    CREATE TABLE IF NOT EXISTS links (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      is_press BOOLEAN,
      is_social_profile BOOLEAN,
      title VARCHAR(255),
      url VARCHAR(255) NOT NULL,
      attribution VARCHAR(255),
      published_date DATE,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      quotation VARCHAR(255),
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      is_hidden_on_about_page BOOLEAN
    );
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_links_url
      ON links (url);
  `
}

async function createEmailSubscriptionsTable() {
  await enableUuidExtension()
  await sql`
    CREATE TABLE IF NOT EXISTS email_subscriptions (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      email VARCHAR(255) NOT NULL,
      exported_at TIMESTAMP WITHOUT TIME ZONE
    );
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_email_subscriptions_email
      ON email_subscriptions (email);
  `
}

async function createEmbedCodesTable() {
  await enableUuidExtension()
  await sql`
    CREATE TABLE IF NOT EXISTS embed_codes (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      caption VARCHAR(255),
      iframe VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      title VARCHAR(255),
      media_type TEXT CHECK (media_type IN ('video', 'audio'))
    );
  `

  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_embed_codes_iframe
      ON embed_codes (iframe);
  `
}

async function createVenuesTable() {
  await enableUuidExtension()

  await sql`
    CREATE TABLE IF NOT EXISTS venues (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      address VARCHAR(255),
      city VARCHAR(255) NOT NULL,
      name VARCHAR(255),
      state VARCHAR(255),
      country VARCHAR(255),
      url VARCHAR(255),
      primary_venue_id UUID,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      CONSTRAINT fk_primary_venue
        FOREIGN KEY (primary_venue_id)
        REFERENCES venues(id)
        ON DELETE SET NULL
    );
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_venues_name
      ON venues (name);
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_venues_url
      ON venues (url);
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_venues_primary
      ON venues (primary_venue_id);
  `
}

// fixme: added timezones, removed embed_codes, made _id optional
async function createEventsTable() {
  await enableUuidExtension()

  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      _id VARCHAR(255),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      start_date TIMESTAMP WITH TIME ZONE NOT NULL,
      end_date TIMESTAMP WITH TIME ZONE,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
      ticket_link VARCHAR(255),
      is_published BOOLEAN,
      venue_id UUID NOT NULL,
      image_ids UUID[],
      link_ids UUID[],
      project_ids UUID[],
      embed_code_ids UUID[],
      CONSTRAINT fk_events_venue
        FOREIGN KEY (venue_id)
        REFERENCES venues(id)
        ON DELETE CASCADE
    );
  `

  // Optional indexes
  await sql`
    CREATE INDEX IF NOT EXISTS idx_events_slug
      ON events (slug);
  `

  await sql`
    CREATE INDEX IF NOT EXISTS idx_events_venue
      ON events (venue_id);
  `
}
async function setupSlugHistory() {
  await enableUuidExtension()

  // 1. Create the slug_history table
  await sql`
    CREATE TABLE IF NOT EXISTS slug_history (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      table_name VARCHAR(50) NOT NULL,
      row_id UUID NOT NULL,
      old_slug VARCHAR(255) NOT NULL,
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
    );
  `

  // 2. Indexes
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_slug_history_table_slug
      ON slug_history (table_name, old_slug);
  `
  await sql`
    CREATE INDEX IF NOT EXISTS idx_slug_history_row
      ON slug_history (row_id);
  `

  // 3. Create trigger function to save old slugs
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

  // 4. Trigger for events table
  await sql`
    DROP TRIGGER IF EXISTS trg_events_slug_update ON events;
  `
  await sql`
    CREATE TRIGGER trg_events_slug_update
    BEFORE UPDATE OF slug ON events
    FOR EACH ROW
    EXECUTE FUNCTION save_old_slug();
  `

  // 5. Trigger for releases table
  await sql`
    DROP TRIGGER IF EXISTS trg_releases_slug_update ON releases;
  `
  await sql`
    CREATE TRIGGER trg_releases_slug_update
    BEFORE UPDATE OF slug ON releases
    FOR EACH ROW
    EXECUTE FUNCTION save_old_slug();
  `
}

async function createReleasesTable() {
  await enableUuidExtension()

  await sql`
    CREATE TABLE IF NOT EXISTS releases (
      id UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description VARCHAR(5000),
      created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
      release_date DATE NOT NULL,
      image_ids UUID[],
      embed_code_ids UUID[]
      project_ids UUID[],
      link_ids UUID[],
      label VARCHAR(255),
      format VARCHAR(255),
      is_published BOOLEAN,
      is_feature BOOLEAN,
      is_compilation BOOLEAN,
      is_collaboration BOOLEAN,
      artist VARCHAR(255),
      is_single BOOLEAN,
      type VARCHAR(20),
      CHECK (type IN ('album', 'ep', 'soundtrack', 'feature', 'compilation', 'collaborative_release', 'single') OR type IS NULL),
    );
  `

  // Unique index on current slugs for redirect safety
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_releases_slug_current
      ON releases (slug);
  `

  // Optional index for fast lookups
  await sql`
    CREATE INDEX IF NOT EXISTS idx_releases_release_date
      ON releases (release_date);
  `
}


export async function createTables() {
  await enableUuidExtension()
  await setupSlugHistory()
  await createUsersTable()
  await createImagesTable()
  await createEmbedCodesTable()
  await createLinksTable()
  await createSiteSettingsTable()
  await createAboutTable()
  await createEmailSubscriptionsTable()
  await createVenuesTable()
  await createEventsTable()
  await createReleasesTable()
}
