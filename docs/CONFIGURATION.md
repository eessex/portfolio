# Configuration

If you deployed with [SETUP.md](SETUP.md), Vercel sets everything you need
when you connect Neon and Blob, and you don't need this page. It's for
local development and unusual setups.

All variables are listed and commented in `.env.example`.

| Variable                   | Required    | Notes                                                                                                                                             |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`             | yes         | Neon Postgres pooled connection string. Set automatically by the Vercel + Neon integration.                                                       |
| `DATABASE_URL_UNPOOLED`    | no          | Direct connection used by `pnpm migrate`. Derived from `DATABASE_URL` (dropping `-pooler`) when unset.                                            |
| `AUTH_SECRET`              | no          | Session encryption secret, **unique per instance**. When unset, the secret `pnpm migrate` generates and stores in the database is used.           |
| `AUTH_URL`                 | no          | Auto-detected on Vercel. Set it only if you hit login callback-URL issues.                                                                        |
| `BLOB_READ_WRITE_TOKEN`    | for uploads | Vercel Blob store token. Set automatically when a Blob store is connected to the Vercel project; copy it from the store's settings for local dev. |
| `BLOB_STORE_ID`            | no          | Blob store id for the public host. Otherwise read from `BLOB_READ_WRITE_TOKEN`.                                                                   |
| `MIGRATE_PREVIEWS`         | no          | Preview builds only. Set with `PRODUCTION_DATABASE_HOST` to migrate each preview's own Neon branch.                                               |
| `PRODUCTION_DATABASE_HOST` | no          | Preview builds only. Production's bare database host, so a preview never migrates production.                                                     |
