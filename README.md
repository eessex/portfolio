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
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). The dev server runs with Turbopack.

On first run against a fresh database, the tables need to be created — see `src/seed/createTables.ts`, which defines every table, constraint, and index (there is no migration tool; this file is the schema source of truth).

## Environment variables

Copy `.env` (or create one) with the following:

**Database**
- `DATABASE_URL` — Postgres connection string used by `src/lib/db.ts` (the only DB var actually read at runtime; the `PG*`/`POSTGRES_*` variables in `.env` are unused alternates left over from provider templates and can be omitted)

**Auth** ([next-auth](https://authjs.dev) v5)
- `AUTH_SECRET` — session encryption secret
- `AUTH_URL` — canonical app URL used by next-auth

**Image storage (S3)**
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`
- `AWS_S3_BUCKET_NAME`
- `AWS_S3_REGION`
- `AWS_S3_BASE_URL`
- `REMOTE_IMAGE_HOSTNAME` / `REMOTE_IMAGE_HOSTNAME_OLD` — hostnames allow-listed for `next/image` in `next.config.ts` (the "old" one supports serving images from a previous bucket during a migration)

**Site branding (public, client-exposed)**
- `NEXT_PUBLIC_SITE_TITLE`
- `NEXT_PUBLIC_SITE_DESCRIPTION`
- `NEXT_PUBLIC_SITE_IMAGE_LG`

## Scripts

```bash
pnpm dev           # start dev server (Turbopack)
pnpm build         # production build
pnpm start         # run a production build
pnpm lint          # eslint .
pnpm prettier      # prettier --write .
pnpm test          # run the jest suite
pnpm test:watch    # jest --watch
```

## Architecture

**Data layer.** No ORM — all queries are hand-written tagged-template SQL via the `sql` client in `src/lib/db.ts`. Each content type (releases, events, projects, venues, links, images, embed codes, about, site settings, users, email subscriptions) lives under `src/lib/<domain>/` with a consistent split:

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
