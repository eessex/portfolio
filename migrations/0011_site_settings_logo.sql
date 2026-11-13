-- The menubar logo; is_logo_only hides the title text beside it
-- (ignored while there's no logo).
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS logo_image_id UUID
    REFERENCES images(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS is_logo_only BOOLEAN NOT NULL DEFAULT false;
