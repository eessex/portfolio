-- The menubar's shown items, in order, each { path, label? }; paths
-- are validated in code, so adding one needs no migration. NULL
-- renders the default menu.
ALTER TABLE site_settings ADD COLUMN IF NOT EXISTS nav_items JSONB;
