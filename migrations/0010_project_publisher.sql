-- A recordLabel project's own publisher: the default project's is the
-- site's house publisher, and a non-default one's marks an imprint.
-- One publisher belongs to at most one project.
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS publisher_id UUID
  REFERENCES publishers(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_publisher_id
  ON projects (publisher_id) WHERE publisher_id IS NOT NULL;
