-- A reset link records its target's session_version when created and
-- works only while it still matches, so any password or email change
-- (each bumps the version) voids outstanding links. NULL for invites,
-- which have no user yet.
ALTER TABLE user_tokens ADD COLUMN IF NOT EXISTS session_version INTEGER;
