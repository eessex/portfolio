-- One-time links an admin hands out: invites (user_id NULL until
-- accepted, since the invitee has no account yet) and password resets
-- for another admin (user_id = whose password). Only a sha256 hash of
-- the token is stored, looked up by that hash. purpose's allowed
-- values are a CHECK synced from code by the every-deploy steps.
CREATE TABLE IF NOT EXISTS user_tokens (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  purpose    TEXT NOT NULL,
  token_hash TEXT NOT NULL,
  user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_tokens_token_hash
  ON user_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_user_tokens_user
  ON user_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_user_tokens_created_by
  ON user_tokens(created_by);
