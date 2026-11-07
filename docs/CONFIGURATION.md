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
| `STORAGE_PROVIDER`         | no          | `blob` or `s3`. Defaults to `blob` when `BLOB_READ_WRITE_TOKEN` is set, else `s3`.                                                                |
| `MIGRATE_PREVIEWS`         | no          | Preview builds only. Set with `PRODUCTION_DATABASE_HOST` to migrate each preview's own Neon branch.                                               |
| `PRODUCTION_DATABASE_HOST` | no          | Preview builds only. Production's bare database host, so a preview never migrates production.                                                     |

## Deprecated: S3 storage

Vercel Blob is the supported image store. The S3 variables are needed only to move an existing instance's images off an S3 bucket onto Blob (`pnpm run copy-storage --to blob`, then set `STORAGE_PROVIDER=blob` or unset it, and redeploy). Once that's done, remove them. Don't set them up for a new instance.

| Variable                | Notes                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `AWS_ACCESS_KEY_ID`     | IAM key that can read the bucket.                                                                |
| `AWS_SECRET_ACCESS_KEY` |                                                                                                  |
| `AWS_S3_BUCKET_NAME`    |                                                                                                  |
| `AWS_S3_REGION`         |                                                                                                  |
| `REMOTE_IMAGE_HOSTNAME` | Overrides the bucket's host, which is otherwise derived as `<bucket>.s3.<region>.amazonaws.com`. |
