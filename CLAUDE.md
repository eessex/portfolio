# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev             # start dev server (turbopack) on localhost:3000
pnpm build           # production build
pnpm lint            # eslint .
pnpm typecheck       # tsc --noEmit
pnpm prettier        # prettier --write .
pnpm test            # jest
pnpm test:watch      # jest --watch
pnpm test:quiet      # jest --silent --noStackTrace (summary output only)
```

Run a single test file: `NODE_OPTIONS=--no-deprecation jest src/lib/releases/data.test.ts`
Run a single test by name: add `-t "test name"`.

When running commands agentically, keep output minimal: prefer the single-file jest invocation (with `--silent`) while iterating and `pnpm test:quiet` for full-suite checks; drop the flags only when a failure needs its console output or stack trace. Don't run `pnpm build` unless the task specifically requires verifying the production build — `pnpm typecheck` + `pnpm lint` cover correctness checks.

Package manager is pnpm (`packageManager: pnpm@11.0.0`); Node 22.x. There is no CI config in this repo — lint/test/build are run locally.

## Architecture

This is a Next.js 16 (App Router, `cacheComponents` enabled) CMS for a personal portfolio site, backed directly by Postgres (Neon serverless) with no ORM — all queries are hand-written tagged-template SQL via the `sql` client in `src/lib/db.ts`.

### Domain module layout

Each content type (`releases`, `events`, `projects`, `venues`, `links`, `images`, `embed-codes`, `about`, `site-settings`, `users`, `email-subscriptions`) lives under `src/lib/<domain>/` with a consistent file split:

- `data.ts` — raw read queries (`fetch*`), exported for direct use and wrapped by `cached.ts`
- `cached.ts` — `'use cache'` wrappers around `data.ts` reads, applying `cacheTag(...)` (e.g. `releases`, `releases:authed`/`releases:public`, `project:<id>:releases`) so `updateTag` in `actions.ts` can invalidate precisely
- `actions.ts` — `'use server'` mutations (create/update/delete), calling `updateTag(...)` after writes
- `schemas.ts` — Zod schemas per domain (often split into `schemas/db.ts` etc. for larger domains), built from shared primitives in `src/lib/schemas/primitives.ts` and fields in `src/lib/schemas/fields.ts`
- `types.ts` — types inferred from schemas
- `fixtures.ts` — test fixture builders
- `util.ts` — domain-specific helpers (e.g. `sortReleasesByCategory`)

`src/lib/schemas/index.ts` defines the two cross-cutting taxonomies: `pagePaths` (content types with their own public `/​{path}` and `/{path}/{slug}` pages: about, events, projects, releases) and `embeddedItemTypes` (items with no own page, embedded into pages and reusable across them: embed codes, images, links, published editions, venues).

### Data flow conventions

- DB rows are `snake_case`; client-facing objects are `camelCase`. `formatDbResponseForClient()` (`src/lib/util.ts`) converts via `camelizeKeys()` (`src/lib/strings.ts`), turns `null` into `undefined`, and validates/parses through the domain's Zod schema — always route raw SQL results through this before returning them.
- List endpoints use cursor pagination: `encodeCursor`/`decodeCursor` base64-encode `{ name, id }`, `formatResponseWithCursor()` builds the page + `nextCursor`, page size is `DEFAULT_PAGE_SIZE` (24).
- Server actions (`actions.ts`) receive `FormData`, run it through `normalizeFormData()` (checkbox `'on'` → `true`, empty strings → `undefined`, blank `*Date` fields → `undefined`), then `schema.safeParse()`. Failures return `formatValidationResponse()`; thrown DB errors are caught and returned via `formatErrorResponse()` — actions return a `FormResponse<T>` (`{ ok: true, res }` or `{ ok: false, message, errors? }`) rather than throwing, so UI forms can render field errors inline.
- Auth-aware reads take an `isAuthed` boolean to decide whether unpublished (`is_published = false`) rows are included; API routes and pages pass this from `isAuthed()` in `src/lib/auth/guard.ts`.
- Auth guarding (`src/lib/auth/guard.ts`): every `'use server'` mutation starts with `requireAuth()` (returns a `FormResponse` error to return early with) or `assertAuthed()` (throws, for exposed functions that don't return `FormResponse`, e.g. `uploadFile`/`deleteFromS3`). This is required because middleware only protects page navigation — server actions are invoked by action id and can be POSTed to any public route. Reads are deliberately public: `data.ts` fetchers keep `'use server'` and the embedded-item `/api/*` routes take no session, since embedded items have no publish state. The only deliberately public actions are `authenticate` and `createEmailSubscription`. Tests get an authed session by default from the `@/auth` mock in `src/test/jest.setup.ts`.
- Postgres schema (tables, constraints, indexes) is defined only in `src/seed/createTables.ts` — there are no migration files, so check that file when the on-disk schema for a table needs to be understood or changed.

### Auth

next-auth v5 with a `Credentials` provider (`src/auth.ts`, bcrypt password check against `src/lib/users/data.ts`). Route protection is centralized in `src/auth.config.ts`: `authedPathPatterns` (derived from `pagePaths` for `/*/new` and `/*/:slug/edit`, plus `/about/edit` and `/dashboard/*`) and `unauthedPathPatterns` (`/login`) are checked in the `authorized` callback; everything else is public. `src/proxy.ts` wires this config into the Next.js middleware matcher.

### Images

Uploads go straight to S3 via presigned URLs (`src/lib/images/s3.ts`: `uploadFile` gets a presigned PUT URL then uploads client-side; `deleteFromS3` removes by parsed key). `next.config.ts` restricts `next/image` remote patterns to the configured S3-backed hostnames and serves avif/webp at fixed device/image size steps.

### Testing

Jest + `next/jest` + jsdom, config in `jest.config.ts`. Setup (`src/test/jest.setup.ts`) enables `jest-fetch-mock` and installs `AbortController`/`IntersectionObserver` mocks from `src/test/__mocks__/browser/`. `src/test/__mocks__/next/cache.ts` mocks `'use cache'`/`cacheTag`/`updateTag` for tests. Shared test helpers (`mockFile`, `formDataFromObject`) are in `src/test/helpers.ts`. Domain tests sit next to their source as `*.test.ts` (one legacy `*.spec.ts` in `projects/`).

## Code style

- Formatting is enforced by Prettier (`.prettierrc`): single quotes, no semicolons, no trailing commas, printWidth 70.
- ESLint enforces import sorting (`simple-import-sort`) and type-only imports (`consistent-type-imports`); unused vars/args/catch bindings prefixed with `_` are allowed.
- Path alias `@/*` maps to `src/*`.
