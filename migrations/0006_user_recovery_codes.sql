-- One-time codes a locked-out admin can trade for a new password.
-- Only bcrypt hashes are stored; the plain codes are shown once.
-- A used code keeps its row (used_at set) until the set is replaced.
CREATE TABLE IF NOT EXISTS user_recovery_codes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  user_id    UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  code_hash  TEXT NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_user_recovery_codes_user
  ON user_recovery_codes(user_id);
