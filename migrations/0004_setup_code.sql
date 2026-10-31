-- The one-time code printed in the build log while no user exists,
-- so a fresh import can create its first admin with nothing set by
-- hand. Only its hash and expiry are stored; the plain code lives
-- only in the build log. Written and cleared by the ensureSetupCode
-- every-deploy step.
CREATE TABLE IF NOT EXISTS setup_code (
  id         BOOLEAN PRIMARY KEY DEFAULT true CHECK (id),
  code_hash  TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL
);
