-- The site icon's source image and the ICON_VERSION its generated
-- files (icons/{imageId}/v{version}/...) were written at. A custom icon
-- is served only when both are set.
ALTER TABLE site_settings
  ADD COLUMN IF NOT EXISTS icon_image_id UUID
    REFERENCES images(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS icon_version INTEGER;

CREATE INDEX IF NOT EXISTS idx_site_settings_icon_image
  ON site_settings(icon_image_id);
