# Portfolio CMS

A Next.js CMS for managing and serving a personal portfolio site: releases, events, projects, venues, publishers, press links, embeds, images, and site-wide "about"/settings content. The same app serves both the public site and the admin editing UI.

Built on Next.js 16 (App Router, `cacheComponents`), Postgres ([Neon](https://neon.tech) serverless, no ORM), next-auth v5 for admin login, and S3 for image storage.

## Prerequisites

- Node 22.x
- pnpm 11 (`packageManager` is pinned in `package.json`)
- A Postgres database (this project targets Neon)
- An S3 bucket plus an IAM key that can read/write it, for image uploads

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
4. Creates the database schema from `src/seed/createTables.ts`
5. Creates the first admin user, if none exists yet

Each step checks the current state before it acts. Existing env values are reused and re-validated instead of overwritten, schema creation is `IF NOT EXISTS`-guarded, and admin creation is skipped once any user exists. That makes it **safe to re-run**, for example after pulling schema changes.

> `run` is required. Bare `pnpm setup` invokes pnpm's own built-in command instead of this script.

For non-interactive runs (a fresh deploy, automation), you can provide the admin account through `SETUP_ADMIN_NAME`, `SETUP_ADMIN_EMAIL`, and `SETUP_ADMIN_PASSWORD` instead of the prompts.

There is no admin UI for creating users. Additional users are created server-side via `createUser()` in `src/lib/users/create.ts`.

## Environment variables

All variables are listed and commented in `.env.example`.

| Variable                | Required    | Notes                                                                                                        |
| ----------------------- | ----------- | ------------------------------------------------------------------------------------------------------------ |
| `DATABASE_URL`          | yes         | Neon Postgres connection string. Set automatically by the Vercel + Neon integration.                         |
| `AUTH_SECRET`           | yes         | Session encryption secret, **unique per instance**. Generate with `npx auth secret`.                         |
| `AWS_ACCESS_KEY_ID`     | for uploads |                                                                                                              |
| `AWS_SECRET_ACCESS_KEY` | for uploads |                                                                                                              |
| `AWS_S3_BUCKET_NAME`    | for uploads |                                                                                                              |
| `AWS_S3_REGION`         | for uploads |                                                                                                              |
| `AUTH_URL`              | no          | Auto-detected on Vercel. Set it only if you hit login callback-URL issues.                                   |
| `REMOTE_IMAGE_HOSTNAME` | no          | Overrides the `next/image` allowed host, which is otherwise derived as `<bucket>.s3.<region>.amazonaws.com`. |

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
pnpm check         # typecheck, lint, tests, then build (what CI runs)
pnpm run setup     # interactive first-run setup; safe to re-run
```

To run a single test file: `NODE_OPTIONS=--no-deprecation npx jest src/lib/util.test.ts` (add `-t "name"` to filter by test name).

CI runs through Vercel, which builds every push. `vercel.json` sets Vercel's build command to `pnpm check`, so a deploy fails if typecheck, lint, tests, or the build fail. That setting overrides the build command in the Vercel dashboard. Run `pnpm check` locally to reproduce a CI failure.

## Using the admin

The site has two kinds of content:

- **Page content** (about, events, projects, releases). Each type has a public index at `/{type}` and a detail page at `/{type}/{slug}`. When you're signed in, you edit it in place at `/{type}/new`, `/{type}/{slug}/edit`, and `/about/edit`. Unpublished items are only visible to signed-in users.
- **Embedded items** (embed codes, images, links, published editions, publishers, venues). These are reusable pieces with no page of their own that get attached to page content. You can manage them under `/dashboard/*`, or create and edit them inline from any form that uses them (see the item pickers below).

Images, links, embed codes, releases, events, and published editions can each belong to a project. Items with no project are available anywhere. Attaching an item to a project, or detaching it, updates that ownership automatically when the project is saved.

## Project layout

```
scripts/setup.ts        first-run setup
src/app/                routes: public pages, (item-pages), /dashboard, /api, /login
src/auth.ts             next-auth credentials provider
src/auth.config.ts      which routes require a session
src/proxy.ts            middleware wiring for auth.config
src/lib/<domain>/       per-content-type data, cache, actions, schemas
src/lib/form-action.ts  shared server-action pipeline
src/lib/list-fetch.ts   shared cursor-paginated list query
src/seed/createTables.ts  the Postgres schema (single source of truth)
src/ui/                 shared React components (item-picker, combobox, form, ...)
src/test/               jest setup, mocks, helpers
```

## Architecture

**Data layer.** There is no ORM. Every query is hand-written tagged-template SQL through the `sql` client in `src/lib/db.ts`. Each content type lives under `src/lib/<domain>/` with the same file split:

- `data.ts`: raw read queries (`fetch*`)
- `cached.ts`: `'use cache'` wrappers tagged with `cacheTag` for targeted invalidation
- `actions.ts`: `'use server'` mutations that call `updateTag` after writes
- `schemas.ts` / `types.ts`: Zod validation and inferred types
- `fixtures.ts`: test fixture builders

DB rows are `snake_case`. Everything that reaches the client is converted to `camelCase` and validated against its Zod schema by `formatDbResponseForClient` (`src/lib/util.ts`). List endpoints use cursor pagination through `runListFetch()` (`src/lib/list-fetch.ts`).

**Schema.** `src/seed/createTables.ts` defines every table, constraint, and index. There are no migration files. The file is idempotent. To change the schema, add statements guarded the same way (`IF NOT EXISTS`, or an `information_schema` check for constraints) and re-run `pnpm run setup`.

**Mutations.** Server actions take `FormData` and return a `FormResponse` (`{ ok: true, res }` or `{ ok: false, message, errors? }`) instead of throwing, so forms can show field errors inline. The shared pipeline in `src/lib/form-action.ts` (`runFormAction` / `runDeleteAction`) runs the steps in this order: auth check, normalize, Zod validate, save, invalidate cache tags, format errors. Each domain supplies only its schema, SQL callbacks, and tags.

**Item pickers.** `ItemPicker` (`src/ui/item-picker/`) is the shared control for attaching embedded items to a form. You can search for and select an existing item, create a new one, or edit a selected one inline, without leaving the parent form. Picker fields are namespaced with helpers from `src/lib/item-fields.ts` (for example `venue.city`, or `images[0].url`), and `extractPrefixedGroup` / `extractIndexedGroups` in `src/lib/util.ts` parse them back on the server.

**Auth.** next-auth v5 with a credentials provider (email plus a bcrypt-hashed password; see `src/auth.ts`). Page protection is centralized in `src/auth.config.ts`. Middleware only guards page navigation, so every server action also checks the session itself: the shared action pipeline does this, and custom actions call `requireAuth()` / `assertAuthed()` from `src/lib/auth/guard.ts`. Reads are intentionally public. The only public mutations are login and email subscription.

**Images.** Uploads go straight from the browser to S3 via presigned URLs (`src/lib/images/s3.ts`), capped at 1MB. `next.config.ts` limits `next/image` to the configured S3 host and serves avif/webp.

**Embed codes.** When you paste an embed (SoundCloud, Mixcloud, YouTube, and so on), the server resolves its oEmbed metadata (`src/lib/embed-codes/oembed.ts`). It then generates a cover image with `sharp` and uploads it to S3. The embed's title is always derived by the system and can't be edited.

**Testing.** Jest with `next/jest` and jsdom. Tests sit next to their source as `*.test.ts(x)`. `src/test/` has the shared mocks (fetch, `AbortController`, `IntersectionObserver`, `'use cache'`/`cacheTag`) and helpers. Tests get an authenticated session by default.

## Known gaps

- `releases` is read-only for now. There is no `actions.ts`, so releases can't be created or edited from the admin yet.
- `tags` exist in the DB and Zod schemas, but nothing reads or writes them yet.

## Code style

Prettier (single quotes, no semicolons, no trailing commas, width 70) and ESLint (sorted imports, `import type` for type-only imports) enforce most conventions. Boolean names use an `isX` prefix (`isSaved`, not `saved`). The path alias `@/*` maps to `src/*`.
