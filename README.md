# Portfolio CMS

A Next.js CMS for managing and serving a personal portfolio site (releases, events, projects, venues, press links, media, and site-wide "about"/settings content). Built on Next.js 16 (App Router) with Postgres (Neon serverless) as the data store, next-auth for the admin login, and S3 for image storage.

## Prerequisites

- Node 22.x
- pnpm 11 (`packageManager` is pinned in `package.json`)
- A Postgres database (this project targets [Neon](https://neon.tech))
- An S3-compatible bucket for image uploads

## Getting started

```bash
pnpm install
pnpm run setup   # interactive: .env, DB schema, first admin user
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server runs with Turbopack.

### `pnpm run setup`

`scripts/setup.ts` walks through everything needed to go from a fresh clone to a running instance:

1. Copies `.env.example` → `.env` (if `.env` doesn't exist yet)
2. Generates `AUTH_SECRET` and writes it to `.env` (if unset)
3. Prompts for your Postgres `DATABASE_URL` (with links to where to find it), testing the connection and re-prompting until it succeeds
4. Creates the database schema — see `src/seed/createTables.ts`, which defines every table, constraint, and index (there is no migration tool; this file is the schema source of truth)
5. Creates the first admin user, if none exists yet

Every step checks current state before acting (existing `.env`/`AUTH_SECRET`/`DATABASE_URL` values are reused and re-validated rather than overwritten, table/constraint creation is guarded so re-running it against an already-provisioned database is a no-op, and admin creation is skipped once any user exists), so **it's safe to run again** — e.g. after pulling schema changes, or to re-check your env.

Note: `run` is required — bare `pnpm setup` invokes pnpm's own built-in setup command instead of this script.

For non-interactive/scripted runs (e.g. CI or a fresh deploy), supply the admin account via env vars instead of prompts: `SETUP_ADMIN_NAME`, `SETUP_ADMIN_EMAIL`, `SETUP_ADMIN_PASSWORD`.

If you'd rather configure things by hand, `cp .env.example .env` and fill in `DATABASE_URL`, `AUTH_SECRET`, and the S3 vars directly, then run the schema creation separately.

## Environment variables

Copy `.env.example` to `.env` and fill it in. There are five required vars (plus a
couple of optional ones); every one is listed and commented in `.env.example`.

**Database (required)**

- `DATABASE_URL` — Neon Postgres connection string used by `src/lib/db.ts` (the app throws on startup if it's missing). Set automatically if you deploy via the Vercel + Neon integration.

**Auth (required)** ([next-auth](https://authjs.dev) v5)

- `AUTH_SECRET` — session encryption secret; **unique per instance**. Generate with `npx auth secret`.
- `AUTH_URL` — _optional on Vercel_ (the deployment URL is auto-detected). Set it only if you hit login callback-URL issues.

**Image storage — S3 (required for uploads)**

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `AWS_S3_REGION`

The host that `next/image` is allowed to load uploads from is **derived** in
`next.config.ts` from `AWS_S3_BUCKET_NAME` + `AWS_S3_REGION` (as
`<bucket>.s3.<region>.amazonaws.com`) Provide the
optional `REMOTE_IMAGE_HOSTNAME` only to override it for a non-standard S3 endpoint.

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
pnpm test:quiet    # jest --silent --noStackTrace
pnpm run setup     # interactive first-run setup (see above); safe to re-run
```

## Architecture

**Data layer.** No ORM — all queries are hand-written tagged-template SQL via the `sql` client in `src/lib/db.ts`. Each content type (releases, events, projects, venues, links, images, embed codes, published editions, about, site settings, users, email subscriptions) lives under `src/lib/<domain>/` with a consistent split:

- `data.ts` — raw read queries
- `cached.ts` — `'use cache'` wrappers with `cacheTag`s for targeted invalidation
- `actions.ts` — `'use server'` mutations that call `updateTag` after writes
- `schemas.ts` / `types.ts` — Zod validation and inferred types
- `fixtures.ts` — test fixture builders

DB rows are `snake_case`; everything crossing into the client is converted to `camelCase` and validated against its Zod schema via `formatDbResponseForClient` (`src/lib/util.ts`).

**Content model.** `src/lib/schemas/index.ts` distinguishes two kinds of content: `pagePaths` (about, events, projects, releases — each gets its own `/{path}` index and `/{path}/{slug}` detail page) and `embeddedItemTypes` (embed codes, images, links, published editions, venues — reusable items with no page of their own, attached to page content).

**Auth.** next-auth v5 with a credentials provider (email + bcrypt-hashed password, see `src/auth.ts`). Route protection is centralized in `src/auth.config.ts`, which pattern-matches which paths require a session (e.g. `/*/new`, `/*/:slug/edit`, `/dashboard/*`) versus which are public.

**Images.** Uploads go directly to S3 via presigned URLs (`src/lib/images/s3.ts`); `next.config.ts` restricts `next/image` to the configured S3 hostnames and serves avif/webp at fixed size steps.

**Testing.** Jest + `next/jest` + jsdom. Tests live next to their source as `*.test.ts`. See `src/test/` for shared mocks (fetch, `AbortController`, `IntersectionObserver`, and a `'use cache'`/`cacheTag` mock) and helpers.
