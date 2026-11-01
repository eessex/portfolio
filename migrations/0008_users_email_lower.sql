-- Emails are unique regardless of case, matching the login throttle
-- (keyed by the lowercased email). Fails if two rows already differ
-- only in case; merge or rename one first.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower
  ON users(lower(email));
