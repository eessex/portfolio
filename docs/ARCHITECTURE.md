# Architecture

How the code is organized. For running it locally, see
[CONTRIBUTING.md](../CONTRIBUTING.md).

The same Next.js app serves the public site and the admin editing UI.
It's built on Next.js 16 (App Router, `cacheComponents`), Postgres
([Neon](https://neon.tech) serverless, no ORM), next-auth v5 for admin
login, and Vercel Blob for image storage. For how the content model looks
to a site owner, see [USING.md](USING.md).

## Project layout

```
scripts/migrate.ts      migration runner (logic in scripts/migrate/)
scripts/copy-storage.ts, backfill-image-variants.ts, migrate-mongo.ts  one-off data scripts
scripts/reset-password.ts  last-resort reset link for a locked-out admin
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

## How it works

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

**Auth.** next-auth v5 with a credentials provider (email plus a bcrypt-hashed password; see `src/auth.ts`). Page protection is centralized in `src/auth.config.ts`. Middleware only guards page navigation, so every server action also checks the session itself: the shared action pipeline does this, and custom actions call `requireAuth()` / `assertAuthed()` from `src/lib/auth/guard.ts`. Reads are intentionally public. A few mutations are deliberately public too, each gated by something other than a session and rate-limited in Postgres (`src/lib/auth/rate-limit.ts`):

- `authenticate` (login): failed logins back off exponentially per email.
- `createEmailSubscription`: limited per IP.
- `completeSetup` (`/setup`): needs the setup code from `pnpm migrate`, and attempts and failed codes are limited per IP.
- `recoverAccount` (`/forgot-password`): needs one of the account's recovery codes. It's limited per IP and backs off per email.
- `acceptInvite` and `resetPasswordWithLink` (`/invite`, `/reset-password`): need a live single-use link token. They're limited per IP and back off on failure.

These four account actions live in `src/lib/users/actions.ts`.

**Images.** The save action reads each upload with `sharp` (JPEG, PNG, WebP or GIF, at least 600px on the short edge), issues the image's id and stores the original at `images/{id}.{ext}` (`src/lib/images/upload.ts`). New files are capped at 4 MB per save, since they go through a server action. Each upload also gets WebP variants at the served widths and a blur placeholder (`src/lib/images/variants.ts`), which `StoredImage` serves straight from storage. Images without variants fall back to the Next.js optimizer until `pnpm run backfill-image-variants` writes them. Storage sits behind one interface (`src/lib/storage/`) with a Blob adapter and a deprecated S3 adapter, kept only for migrating older instances; `publicUrl` is the only code that knows a storage host, so image URLs are derived from the id and format rather than stored. An image's file never changes after upload. Moving an S3 instance to Blob is `pnpm run copy-storage --to blob`, then setting `STORAGE_PROVIDER=blob` (or unsetting it) and redeploying.

**Embed codes.** When you paste an embed (SoundCloud, Mixcloud, YouTube, and so on), the server resolves its oEmbed metadata (`src/lib/embed-codes/oembed.ts`). It then generates a cover image with `sharp` and stores it. The embed's title is always derived by the system and can't be edited.

**Testing.** Jest with `next/jest` and jsdom. Tests sit next to their source as `*.test.ts(x)`. `src/test/` has the shared mocks (fetch, `AbortController`, `IntersectionObserver`, `'use cache'`/`cacheTag`) and helpers. Tests get an authenticated session by default.

## Known gaps

- `tags` exist in the DB and Zod schemas, but nothing reads or writes them yet.
