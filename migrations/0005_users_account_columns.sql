-- session_version is copied into each session's token at login and
-- compared on every authed request; bumping it (password or email
-- change, recovery, removal) signs out the account's other sessions.
-- last_login_at is shown on the Users page.
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS session_version INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_login_at TIMESTAMPTZ;
