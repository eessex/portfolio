# Portfolio CMS

A Next.js CMS for managing and serving a personal portfolio site: releases, events, projects, venues, publishers, press links, embeds, images, and site-wide "about"/settings content. The same app serves both the public site and the admin editing UI.

Built on Next.js 16 (App Router, `cacheComponents`), Postgres ([Neon](https://neon.tech) serverless, no ORM), next-auth v5 for admin login, and Vercel Blob for image storage.

## Prerequisites

- Node 22.x
- pnpm 11 (`packageManager` is pinned in `package.json`)
- A Postgres database (this project targets Neon)
- A Vercel Blob store, for image uploads

## Getting started

```bash
pnpm install
pnpm run setup   # interactive: .env, DB schema, first admin user
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) and sign in at `/login` with the admin account you just created. Until setup has completed (no site settings row exists yet), every page redirects logged-out visitors to `/login`.

### `pnpm run setup`

`scripts/setup.ts` takes you from a fresh clone to a running instance:

1. Copies `.env.example` → `.env` (if `.env` doesn't exist yet)
2. Generates `AUTH_SECRET` and writes it to `.env` (if unset)
3. Prompts for your Postgres `DATABASE_URL`, testing the connection and re-prompting until it succeeds
4. Applies database migrations (`pnpm migrate`)
5. Creates the first admin user, if none exists yet

Each step checks the current state before it acts. Existing env values are reused and re-validated instead of overwritten, migrations already applied are skipped, and admin creation is skipped once any user exists. That makes it **safe to re-run**, for example after pulling schema changes.

> `run` is required. Bare `pnpm setup` invokes pnpm's own built-in command instead of this script.

For non-interactive runs (a fresh deploy, automation), you can provide the admin account through `SETUP_ADMIN_NAME`, `SETUP_ADMIN_EMAIL`, and `SETUP_ADMIN_PASSWORD` instead of the prompts.

There is no admin UI for creating users. Additional users are created server-side via `createUser()` in `src/lib/users/create.ts`.

## Environment variables

All variables are listed and commented in `.env.example`.

| Variable                   | Required    | Notes                                                                                                                                             |
| -------------------------- | ----------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| `DATABASE_URL`             | yes         | Neon Postgres pooled connection string. Set automatically by the Vercel + Neon integration.                                                       |
| `DATABASE_URL_UNPOOLED`    | no          | Direct connection used by `pnpm migrate`. Derived from `DATABASE_URL` (dropping `-pooler`) when unset.                                            |
| `AUTH_SECRET`              | yes         | Session encryption secret, **unique per instance**. Generate with `npx auth secret`.                                                              |
| `AUTH_URL`                 | no          | Auto-detected on Vercel. Set it only if you hit login callback-URL issues.                                                                        |
| `BLOB_READ_WRITE_TOKEN`    | for uploads | Vercel Blob store token. Set automatically when a Blob store is connected to the Vercel project; copy it from the store's settings for local dev. |
| `BLOB_STORE_ID`            | no          | Blob store id for the public host. Otherwise read from `BLOB_READ_WRITE_TOKEN`.                                                                   |
| `STORAGE_PROVIDER`         | no          | `blob` or `s3`. Defaults to `blob` when `BLOB_READ_WRITE_TOKEN` is set, else `s3`.                                                                |
| `MIGRATE_PREVIEWS`         | no          | Preview builds only. Set with `PRODUCTION_DATABASE_HOST` to migrate each preview's own Neon branch.                                               |
| `PRODUCTION_DATABASE_HOST` | no          | Preview builds only. Production's bare database host, so a preview never migrates production.                                                     |

### Deprecated: S3 storage

Vercel Blob is the supported image store. The S3 variables are needed only to move an existing instance's images off an S3 bucket onto Blob (`pnpm run copy-storage --to blob`, then set `STORAGE_PROVIDER=blob` or unset it, and redeploy). Once that's done, remove them. Don't set them up for a new instance.

| Variable                | Notes                                                                                            |
| ----------------------- | ------------------------------------------------------------------------------------------------ |
| `AWS_ACCESS_KEY_ID`     | IAM key that can read the bucket.                                                                |
| `AWS_SECRET_ACCESS_KEY` |                                                                                                  |
| `AWS_S3_BUCKET_NAME`    |                                                                                                  |
| `AWS_S3_REGION`         |                                                                                                  |
| `REMOTE_IMAGE_HOSTNAME` | Overrides the bucket's host, which is otherwise derived as `<bucket>.s3.<region>.amazonaws.com`. |

## Scripts

```bash
pnpm dev           # start dev server (Turbopack)
pnpm build         # production build
pnpm start         # run a production build
pnpm lint          # eslint .
pnpm typecheck     # tsc --noEmit
pnpm prettier      # prettier --write .
pnpm test          # run the jest suite
pnpm test:watch    # jest --watch
pnpm test:quiet    # jest --silent --noStackTrace (summary only)
pnpm check         # typecheck, lint, tests, then build
pnpm migrate       # apply pending migrations to the database .env points at
pnpm run setup     # interactive first-run setup; safe to re-run
pnpm run copy-storage --to blob [--dry-run]  # copy stored files from S3 (deprecated) to Blob
pnpm run copy-storage --rename-only [--dry-run]  # move older images (e.g. an old bucket's) to images/{id}.{ext} on the current provider
pnpm run backfill-image-variants [--dry-run]     # write missing or outdated WebP variants, then redeploy
pnpm run backfill-image-variants --prune [--dry-run]  # delete old variant versions (only once the redeploy is live)
pnpm run migrate-mongo --input <dir> [--dry-run]  # one-off import of the old site's Mongo exports
```

To run a single test file: `NODE_OPTIONS=--no-deprecation npx jest src/lib/util.test.ts` (add `-t "name"` to filter by test name).

Checks run in GitHub Actions: typecheck, lint and tests on every pull request and push to `main`. Vercel builds every push with `pnpm migrate && pnpm build` (set in `vercel.json`, which overrides the dashboard's build command), so a deploy fails if a migration or the build fails. Production builds migrate the production database; preview builds skip migrations unless they have their own Neon branch and `MIGRATE_PREVIEWS`/`PRODUCTION_DATABASE_HOST` are set (see "Migrating preview deployments" in `CONTRIBUTING.md`). Run `pnpm check` locally to reproduce a failure.

## Using the admin

The site has two kinds of content:

- **Page content** (events, projects, releases). Each type has a public index at `/{type}` and a detail page at `/{type}/{slug}`. When you're signed in, you edit it in place at `/{type}/new` and `/{type}/{slug}/edit`. Unpublished items are only visible to signed-in users.
- **Embedded items** (embed codes, images, links, publishers, venues). These are reusable pieces with no page of their own that get attached to page content. You can manage them under `/dashboard/*`, or create and edit them inline from any form that uses them (see the item pickers below).

`/about` is the **default project**, the site's own project, edited at `/about/edit`. It renders like any project, with a carousel of the other projects below it. It can't be deleted, and project indexes leave it out.

Every release belongs to a project, and an event may too. Deleting a project hands its releases and events to the default project. A release's **published editions** (format, publisher, date) are edited only inline in the release form. The release date is the earliest edition's date. Images, links and embed codes have no owner. A project lists the ones it uses.

Site settings (`/dashboard`) hold the site title, description, cover image, site icon (the favicon and home-screen icon, generated from one square image of at least 600 × 600), footer social links, and whether the footer shows the email subscribe form.

## Project layout

```
scripts/setup.ts        first-run setup
scripts/migrate.ts      migration runner (logic in scripts/migrate/)
scripts/copy-storage.ts, backfill-image-variants.ts, migrate-mongo.ts  one-off data scripts
src/app/                routes: public pages, (item-pages), /dashboard, /api, /login
src/auth.ts             next-auth credentials provider
src/auth.config.ts      which routes require a session
src/proxy.ts            middleware wiring for auth.config
src/lib/<domain>/       per-content-type data, cache, actions, schemas
src/lib/form-action.ts  shared server-action pipeline
src/lib/list-fetch.ts   shared cursor-paginated list query
migrations/             versioned schema migrations (`pnpm migrate`)
src/seed/every-deploy.ts  CHECKs, triggers and SQL functions re-run on every migrate
src/ui/                 shared React components (item-picker, combobox, form, ...)
src/test/               jest setup, mocks, helpers
```

## Architecture

**Data layer.** There is no ORM. Every query is hand-written tagged-template SQL through the `sql` client in `src/lib/db.ts`. Each content type lives under `src/lib/<domain>/` with the same file split:

- `data.ts`: raw read queries (single items, and the uncached `fetch*Raw` list query)
- `cached.ts`: `'use cache'` wrappers tagged with `cacheTag` for targeted invalidation, plus each list's `fetch*` entry point (cached first page; later pages and searches go uncached)
- `actions.ts`: `'use server'` mutations that call `updateTag` after writes
- `schemas.ts` / `types.ts`: Zod validation and inferred types
- `fixtures.ts`: test fixture builders

DB rows are `snake_case`. Everything that reaches the client is converted to `camelCase` and validated against its Zod schema by `formatDbResponseForClient` (`src/lib/util.ts`). List endpoints use cursor pagination through `runListFetch()` (`src/lib/list-fetch.ts`).

**Schema.** Tables, columns and indexes come from the versioned files in `migrations/`, applied in order by `pnpm migrate` (`scripts/migrate.ts`), each once per database and never edited after it ships. `0001_baseline.ts` is the schema from before migrations existed. Enum-like CHECKs, slug triggers, SQL functions and the built-in publisher are re-applied on every run from `src/seed/every-deploy.ts`, since their SQL follows the code. To change the schema, add a new `migrations/NNNN_short_name.sql` and run `pnpm migrate`.

**Mutations.** Server actions take `FormData` and return a `FormResponse` (`{ ok: true, res }` or `{ ok: false, message, errors? }`) instead of throwing, so forms can show field errors inline. The shared pipeline in `src/lib/form-action.ts` (`runFormAction` / `runDeleteAction`) runs the steps in this order: auth check, normalize, Zod validate, save, invalidate cache tags, format errors. Each domain supplies only its schema, SQL callbacks, and tags.

**Item pickers.** `ItemPicker` (`src/ui/item-picker/`) is the shared control for attaching embedded items to a form. You can search for and select an existing item, create a new one, or edit a selected one inline, without leaving the parent form. Picker fields are namespaced with helpers from `src/lib/item-fields.ts` (for example `venue.city`, or `images[0].url`), and `extractPrefixedGroup` / `extractIndexedGroups` in `src/lib/util.ts` parse them back on the server.

**Auth.** next-auth v5 with a credentials provider (email plus a bcrypt-hashed password; see `src/auth.ts`). Page protection is centralized in `src/auth.config.ts`. Middleware only guards page navigation, so every server action also checks the session itself: the shared action pipeline does this, and custom actions call `requireAuth()` / `assertAuthed()` from `src/lib/auth/guard.ts`. Reads are intentionally public. The only public mutations are login and email subscription. Both are rate-limited in Postgres (`src/lib/auth/rate-limit.ts`): failed logins back off exponentially per email, and subscriptions are limited per IP.

**Images.** The save action reads each upload with `sharp` (JPEG, PNG, WebP or GIF, at least 600px on the short edge), issues the image's id and stores the original at `images/{id}.{ext}` (`src/lib/images/upload.ts`). New files are capped at 4 MB per save, since they go through a server action. Each upload also gets WebP variants at the served widths and a blur placeholder (`src/lib/images/variants.ts`), which `StoredImage` serves straight from storage. Images without variants fall back to the Next.js optimizer until `pnpm run backfill-image-variants` writes them. Storage sits behind one interface (`src/lib/storage/`) with a Blob adapter and a deprecated S3 adapter, kept only for migrating older instances; `publicUrl` is the only code that knows a storage host, so image URLs are derived from the id and format rather than stored. An image's file never changes after upload. Moving an S3 instance to Blob is `pnpm run copy-storage --to blob`, then setting `STORAGE_PROVIDER=blob` (or unsetting it) and redeploying.

**Embed codes.** When you paste an embed (SoundCloud, Mixcloud, YouTube, and so on), the server resolves its oEmbed metadata (`src/lib/embed-codes/oembed.ts`). It then generates a cover image with `sharp` and stores it. The embed's title is always derived by the system and can't be edited.

**Testing.** Jest with `next/jest` and jsdom. Tests sit next to their source as `*.test.ts(x)`. `src/test/` has the shared mocks (fetch, `AbortController`, `IntersectionObserver`, `'use cache'`/`cacheTag`) and helpers. Tests get an authenticated session by default.

## Known gaps

- `tags` exist in the DB and Zod schemas, but nothing reads or writes them yet.

## Code style

Prettier (single quotes, no semicolons, no trailing commas, width 70) and ESLint (sorted imports, `import type` for type-only imports) enforce most conventions. Boolean names use an `isX` prefix (`isSaved`, not `saved`). The path alias `@/*` maps to `src/*`.
