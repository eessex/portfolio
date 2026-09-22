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
pnpm run setup       # interactive first-run setup: .env, DB schema, first admin user (writes to the real DB)
```

Run a single test file: `NODE_OPTIONS=--no-deprecation jest src/lib/releases/data.test.ts`
Run a single test by name: add `-t "test name"`.

When running commands agentically, keep output minimal: prefer the single-file jest invocation (with `--silent`) while iterating and `pnpm test:quiet` for full-suite checks; drop the flags only when a failure needs its console output or stack trace. Don't run `pnpm build` unless the task specifically requires verifying the production build — `pnpm typecheck` + `pnpm lint` cover correctness checks.

Package manager is pnpm (`packageManager: pnpm@11.0.0`); Node 22.x. There is no CI config in this repo — lint/test/build are run locally.

## Architecture

This is a Next.js 16 (App Router, `cacheComponents` enabled) CMS for a personal portfolio site, backed directly by Postgres (Neon serverless) with no ORM — all queries are hand-written tagged-template SQL via the `sql` client in `src/lib/db.ts`.

### Domain module layout

Each content type (`releases`, `events`, `projects`, `venues`, `links`, `images`, `embed-codes`, `published-editions`, `publishers`, `about`, `site-settings`, `users`, `email-subscriptions`) lives under `src/lib/<domain>/` with a consistent file split:

- `data.ts` — raw read queries (`fetch*`), exported for direct use and wrapped by `cached.ts`
- `cached.ts` — `'use cache'` wrappers around `data.ts` reads, applying `cacheTag(...)` (e.g. `releases`, `releases:authed`/`releases:public`, `project:<id>:releases`) so `updateTag` in `actions.ts` can invalidate precisely
- `actions.ts` — `'use server'` mutations (create/update/delete), calling `updateTag(...)` after writes
- `schemas.ts` — Zod schemas per domain (often split into `schemas/db.ts` / `schemas/client.ts` for larger domains), built from shared primitives in `src/lib/schemas/primitives.ts` and fields in `src/lib/schemas/fields.ts`
- `types.ts` — types inferred from schemas
- `fixtures.ts` — test fixture builders
- `util.ts` — domain-specific helpers (e.g. `sortReleasesByCategory`)

`src/lib/schemas/index.ts` defines the two cross-cutting taxonomies: `pagePaths` (content types with their own public `/​{path}` and `/{path}/{slug}` pages: about, events, projects, releases) and `embeddedItemTypes` (items with no own page, embedded into pages and reusable across them: embed codes, images, links, published editions, publishers, venues).

### Project ownership of embedded items

`images`, `links`, and `embed_codes` each carry a nullable `project_id` FK (indexed) back to the project they belong to; `releases`, `events`, and `published_editions` do too. `NULL` means the row belongs to no specific project (the "default" pool available anywhere). `projects/actions.ts` (`syncChildProjectIds`/`diffedIds` in [src/lib/projects/actions.ts](src/lib/projects/actions.ts)) keeps this back-reference in sync whenever a project's `imageIds`/`linkIds`/`embedCodeIds` arrays change on save: newly-attached ids are stamped with the project's id, newly-detached ids are cleared back to `NULL`. Because saving a project can also create images/links/embed codes inline (via their item pickers' create-new flows), `invalidateProjectTags()` invalidates the `images`/`links`/`embed-codes` cache tags too, not just `projects`.

### Data flow conventions

- DB rows are `snake_case`; client-facing objects are `camelCase`. `formatDbResponseForClient()` (`src/lib/util.ts`) converts via `camelizeKeys()` (`src/lib/strings.ts`), turns `null` into `undefined`, and validates/parses through the domain's Zod schema — always route raw SQL results through this before returning them.
- List endpoints use cursor pagination: `encodeCursor`/`decodeCursor` base64-encode `{ name, id }`, `formatResponseWithCursor()` builds the page + `nextCursor`, page size is `DEFAULT_PAGE_SIZE` (24). The list-fetch frame (total count → decode cursor → page query → format + `totalCount` merge, with per-query labelled errors) is implemented once by `runListFetch()` in `src/lib/list-fetch.ts`; a domain's `fetch*Raw` supplies only its `count`/`list` tagged-template SQL callbacks (receiving `like`, `cursorName`, `cursorId` and the full decoded `cursor`), `cursorKey`, schema, and an optional `transform` for grouped page responses (e.g. `sortEventsByCategory`). The count query always runs before the page query — tests mock `sql` and rely on that order.
- Server actions (`actions.ts`) receive `FormData`, run it through `normalizeFormData()` (checkbox `'on'` → `true`, empty strings → `undefined`, blank `*Date` fields → `undefined`), then `schema.safeParse()`. Failures return `formatValidationResponse()`; thrown DB errors are caught and returned via `formatErrorResponse()` — actions return a `FormResponse<T>` (`{ ok: true, res }` or `{ ok: false, message, errors? }`) rather than throwing, so UI forms can render field errors inline. This frame (auth check → normalize → validate → save → invalidate tags → format errors) is implemented once by `runFormAction()`/`runDeleteAction()` in `src/lib/form-action.ts`; a domain's `actions.ts` supplies only its schema, message label, SQL `save`/`del` callbacks, and cache invalidation (plus optional `prepare` for pre-validation work like S3 uploads — a thrown `prepare` error is caught and returned as a normal `{ ok: false }` form error rather than a rejected action — and `isNormalized: false` for schemas validating raw entries). `form-action.ts` also exports `saveItemFromFields()`, the same normalize → validate → create-or-update pipeline for a single item saved from raw fields (not `FormData`) rather than its own form submit — used when an item picker's inline "create/edit" slot saves an embedded item as part of another domain's mutation.
- Embedded items can be created or edited inline from within another item's form via `ItemPicker` (`src/ui/item-picker/item-picker.tsx`) — see "Embedded item pickers" below. On the server, `extractIndexedGroups()` (`src/lib/util.ts`) parses the resulting indexed form groups (`${prefix}[0].field`, ...) into `existing` (untouched selection, just an id), `edited` (an id plus changed fields — an existing item opened and edited inline), or `new` (no id — a pending creation) entries, preserving submission order since some callers derive meaning from position (e.g. "the first entry is the cover image").
- Auth-aware reads take an `isAuthed` boolean to decide whether unpublished (`is_published = false`) rows are included; API routes and pages pass this from `isAuthed()` in `src/lib/auth/guard.ts`.
- Auth guarding (`src/lib/auth/guard.ts`): every `'use server'` mutation is session-checked before any work — form mutations get this from `runFormAction()`/`runDeleteAction()` (which call `requireAuth()` first); bespoke actions call `requireAuth()` (returns a `FormResponse` error to return early with) or `assertAuthed()` (throws, for exposed functions that don't return `FormResponse`, e.g. `uploadFile`/`deleteFromS3`) directly. This is required because middleware only protects page navigation — server actions are invoked by action id and can be POSTed to any public route. Reads are deliberately public: `data.ts` fetchers keep `'use server'` and the embedded-item `/api/*` routes take no session, since embedded items have no publish state. The only deliberately public actions are `authenticate` and `createEmailSubscription`. Tests get an authed session by default from the `@/auth` mock in `src/test/jest.setup.ts`.
- Postgres schema (tables, constraints, indexes) is defined only in `src/seed/createTables.ts` — idempotent and safe to re-run (`IF NOT EXISTS`-guarded, including constraints added via `ALTER TABLE`, which are wrapped in an `information_schema` existence check since Postgres has no `ADD CONSTRAINT IF NOT EXISTS`). There are no migration files, so check that file when the on-disk schema for a table needs to be understood or changed.
- First-run/local setup (`.env` creation, `AUTH_SECRET` generation, `DATABASE_URL` prompt + connection test, schema creation, first admin user) is handled by `scripts/setup.ts` (`pnpm run setup`); every step checks current state before acting, so it's safe to re-run against an already-provisioned instance. Admin creation itself goes through `src/lib/users/create.ts`'s `createUser()`, which is deliberately _not_ a `'use server'` action (only callable from server-side scripts) since user creation has no admin UI.

### Embedded item pickers

`ItemPicker` (`src/ui/item-picker/item-picker.tsx`, backed by `Combobox` in `src/ui/combobox/combobox.tsx`) is the shared control for attaching embedded items (or, for reusable page items like projects, page items) to a form: search-and-select an existing item, or create a new one inline without leaving the parent form. Each open "slot" is either an existing selection, a new item being drafted, or an existing item opened for inline editing; a completed slot collapses into a chip (`renderExistingResult`) rendered via `SelectedResult`, and reopens back into its editor (`renderEditItemForm`) on click. Supports single (`isMulti: false`) or multi-select with drag reordering (`SortableList`), and an optional `featured` toggle that pins one selected item to the front of the list. Domain edit forms passed as `renderEditItemForm` (e.g. `EditEmbedCode`, `EditImage`, `EditLink`, `EditPublisher`) follow a progressive-disclosure pattern — starting minimal (e.g. just a paste-a-URL field) and revealing the rest of the fields once the pasted value resolves — and report readiness/in-flight state back to the picker via `onReadyChange`/`onBusyChange` so it can gate Save on async work (e.g. resolving embed code oEmbed metadata) finishing first.

A slot's fields are namespaced so the parent form's own fields can't collide with them, and the namespace is never passed as a prop: the picker derives it — `${name}[${index}].` when `isMulti`, the item type's singular (`venue.`, `image.`) for a single item — and provides it through `NamePrefixContext` (`src/ui/item-picker/name-prefix.tsx`). Edit forms read it with `useNamePrefix()` and prefix every input `name` with it, which yields the bare names they need when rendered outside a picker (the `/dashboard/*` edit pages) since there's no provider there. Server-side, `extractIndexedGroups()` strips the indexed form, and the `resolve*Id` helpers (`resolveVenueId`, `resolvePublisherId`, `resolveCoverImageId`) strip the single form — each taking the same singular as a default `prefix` argument and deriving its field list from the domain's create schema.

### In-progress scaffolding

One area intentionally doesn't yet follow the full domain-module pattern — treat as a known TODO, not a bug, unless asked to build it out:

- `releases` has no `actions.ts` — only reads (`data.ts`/`cached.ts`) exist, so this domain has no admin create/update/delete path yet (unlike `about`, `projects`, and `events`, which do).
- `tags` is scaffolded in the DB (table + `tag_ids` columns) and in Zod schemas, but has no `src/lib/tags/data.ts` or `actions.ts` — no read/write implementation exists yet.

### Auth

next-auth v5 with a `Credentials` provider (`src/auth.ts`, bcrypt password check against `src/lib/users/data.ts`). Route protection is centralized in `src/auth.config.ts`: `authedPathPatterns` (derived from `pagePaths` for `/*/new` and `/*/:slug/edit`, plus `/about/edit` and `/dashboard/*`) and `unauthedPathPatterns` (`/login`) are checked in the `authorized` callback; everything else is public. `src/proxy.ts` wires this config into the Next.js middleware matcher. Before first-run setup completes (no `site_settings` row yet), every page is gated to `/login` for logged-out visitors — the `authorized` callback checks `hasSiteSettings()` and memoizes a `true` result in module state (an in-memory flag, not cached per-request) so this Edge Middleware callback doesn't pay for a DB round trip on every anonymous page view once the instance is configured; a transient DB error fails open (treated as configured) rather than taking down every public page.

### Images

Uploads go straight to S3 via presigned URLs (`src/lib/images/s3.ts`: `uploadFile` gets a presigned PUT URL then uploads client-side; `deleteFromS3` removes by parsed key). `next.config.ts` restricts `next/image` remote patterns to the configured S3-backed hostnames and serves avif/webp at fixed device/image size steps. Client-side upload size is capped at `MAX_UPLOAD_FILE_SIZE` (1MB, `src/ui/form/file-input-image.tsx`), validated and surfaced as a form error before upload starts. Images have a nullable `type` category (`press` | `documentation` | `flyer` | `artwork`, DB-constrained; replaces the old `is_press` boolean) used for filtering/labelling.

### Embed codes

Beyond storing the pasted iframe/src, `src/lib/embed-codes/` resolves each embed's oEmbed metadata (title, thumbnail) server-side via `oembed.ts` (host-specific handling — e.g. unwrapping SoundCloud/Mixcloud's widget-wrapped `src` to the canonical content URL — since not every host sends CORS headers a browser fetch could rely on) and generates a cover image from it via `cover-image.ts` (using `sharp`, uploaded to S3 through `uploadBufferToS3`); an embed code's `title` is always system-derived from `host`/`src` rather than user-editable. `preview-metadata.ts` exposes a client-callable `previewEmbedCodeMetadata()` for a live title/thumbnail preview while a form is still being filled in, deliberately skipping the S3 upload so an abandoned form doesn't leave orphaned images.

### Testing

Jest + `next/jest` + jsdom, config in `jest.config.ts`. Setup (`src/test/jest.setup.ts`) enables `jest-fetch-mock` and installs `AbortController`/`IntersectionObserver` mocks from `src/test/__mocks__/browser/`. `src/test/__mocks__/next/cache.ts` mocks `'use cache'`/`cacheTag`/`updateTag` for tests. Shared test helpers (`mockFile`, `formDataFromObject`) are in `src/test/helpers.ts`. Domain tests sit next to their source as `*.test.ts` (one legacy `*.spec.ts` in `projects/`).

## Code style

- Formatting is enforced by Prettier (`.prettierrc`): single quotes, no semicolons, no trailing commas, printWidth 70.
- ESLint enforces import sorting (`simple-import-sort`) and type-only imports (`consistent-type-imports`); unused vars/args/catch bindings prefixed with `_` are allowed.
- Path alias `@/*` maps to `src/*`.
