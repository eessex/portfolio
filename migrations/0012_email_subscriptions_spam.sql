-- Spam-marked subscribers stay listed but are never exported.
-- spam_reason: why the rules flagged a row (NULL when marked by
-- hand); its CHECK comes from syncCheckConstraints().
-- is_spam_reviewed: an admin decided, so re-running the rules never
-- overrides them.
-- export_batch_id: the 'new' export that first delivered the row, so
-- that export can be downloaded again.
ALTER TABLE email_subscriptions
  ADD COLUMN IF NOT EXISTS is_spam BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS spam_reason TEXT,
  ADD COLUMN IF NOT EXISTS is_spam_reviewed BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS export_batch_id UUID;
-- the dashboard's newest-first pages
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_created
  ON email_subscriptions (created_at, id);
CREATE INDEX IF NOT EXISTS idx_email_subscriptions_export_batch
  ON email_subscriptions (export_batch_id)
  WHERE export_batch_id IS NOT NULL;

-- One row per export, written in the same statement that stamps its
-- subscribers, so a lost response or download can be recovered from
-- the dashboard. scope's CHECK comes from syncCheckConstraints().
CREATE TABLE IF NOT EXISTS email_subscription_exports (
  id               UUID PRIMARY KEY,
  scope            TEXT NOT NULL,
  subscriber_count INTEGER NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_email_subscription_exports_created
  ON email_subscription_exports (created_at DESC);
