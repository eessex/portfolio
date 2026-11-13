# Contributing

Thanks for your interest! Bug reports and ideas are as welcome as code:
[open an issue](https://github.com/eessex/portfolio/issues). For a
larger change, open an issue first so we can talk it through.

## Licensing your contribution

This project is licensed under the [Functional Source License](LICENSE)
(FSL-1.1-ALv2), and I also offer managed hosting for it. So that I can
keep doing both, and adjust the license in future if needed, I ask
contributors to give me broad rights to their contributions.

By opening a pull request, you agree that:

- the contribution is your own work, or you have the right to submit it;
- it's licensed to everyone under this project's license; and
- you're giving me permission to use, change and build on your
  contribution, including in my managed hosting, and to release it under
  a different license if the project's license changes in future. This
  permission is permanent, so I won't need to track you down later.

You keep the copyright to your work. If you have questions about this,
ask in an issue before you start.

How the code fits together is in
[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and every environment
variable is in [docs/CONFIGURATION.md](docs/CONFIGURATION.md).

## Prerequisites

- Node 22.x
- pnpm 9 or later (CI uses pnpm 11)
- A Postgres database (this project targets Neon)
- A Vercel Blob store, for image uploads

## Getting started

```bash
pnpm install
cp .env.example .env   # then fill in DATABASE_URL and BLOB_READ_WRITE_TOKEN
pnpm migrate           # creates the schema and prints a setup code
pnpm dev
```

Use a database of your own for development, not production's: a [Neon branch](https://neon.com/docs/introduction/branching) of it, or a separate Neon project. The dev server and `pnpm migrate` write to whatever `DATABASE_URL` points at. The same goes for Blob: create a separate store for local uploads and copy its `BLOB_READ_WRITE_TOKEN` from the store's settings. Every variable is described in [docs/CONFIGURATION.md](docs/CONFIGURATION.md). `AUTH_SECRET` is optional, since `pnpm migrate` stores one in the database.

If your Vercel project's **Development** environment holds those values, `vercel link` and then `vercel env pull .env` fills in `.env` instead of copying it. Check what the Development values point at before you run `pnpm migrate`. `env pull` overwrites `.env`.

Open [http://localhost:3000](http://localhost:3000) and go to `/setup` to claim your local instance with the setup code `pnpm migrate` printed, the same way a deployed instance's owner uses the one in its build log (see [`docs/SETUP.md`](docs/SETUP.md#6-claim-your-site)). A later `pnpm migrate` keeps that code until it expires. If you lose it, `pnpm migrate --new-setup-code` replaces it with a new one. Until an admin exists, every page redirects to `/setup`. After that, until site settings are saved, every page redirects logged-out visitors to `/login`. Further admins join through invite links from Dashboard → Users (`/dashboard/users`).

Run `pnpm migrate` again after pulling changes that add migrations.

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
pnpm migrate --new-setup-code  # same, replacing a lost setup code
pnpm run copy-storage --to blob [--dry-run]  # copy stored files from S3 (deprecated) to Blob
pnpm run copy-storage --rename-only [--dry-run]  # move older images (e.g. an old bucket's) to images/{id}.{ext} on the current provider
pnpm run backfill-image-variants [--dry-run]     # write missing or outdated WebP variants, then redeploy
pnpm run backfill-image-variants --prune [--dry-run]  # delete old variant versions (only once the redeploy is live)
pnpm run migrate-mongo --input <dir> [--dry-run]  # one-off import of the old site's Mongo exports
pnpm run reset-password <email> [--url <site>]  # print a one-time password reset link (last-resort recovery)
```

To run a single test file: `NODE_OPTIONS=--no-deprecation npx jest src/lib/util.test.ts` (add `-t "name"` to filter by test name).

Checks run in GitHub Actions: typecheck, lint and tests on every pull request and push to `main`. Vercel builds every push with `pnpm migrate && pnpm build` (set in `vercel.json`, which overrides the dashboard's build command), so a deploy fails if a migration or the build fails. Production builds migrate the production database; preview builds skip migrations unless they have their own Neon branch and `MIGRATE_PREVIEWS`/`PRODUCTION_DATABASE_HOST` are set (see [Migrating preview deployments](#migrating-preview-deployments)). Run `pnpm check` locally to reproduce a failure.

## Code style

Prettier (single quotes, no semicolons, no trailing commas, width 70) and ESLint (sorted imports, `import type` for type-only imports) enforce most conventions. Boolean names use an `isX` prefix (`isSaved`, not `saved`). The path alias `@/*` maps to `src/*`.

## Writing migrations

The schema comes from versioned files in `migrations/`. `pnpm migrate` applies each one once per database, in order, in its own transaction, and records it in `schema_migrations` with a checksum. Production builds run it before `next build`. Enum-like values, slug triggers, SQL functions and the built-in publisher are not migrations: `src/seed/every-deploy.ts` re-applies them on every run.

1. **One change, one new file**: `migrations/NNNN_short_name.sql`, using the next free number. Never edit a file that has shipped in a release. Its checksum is checked on every run, so an edit stops the next deploy.
2. **Plain SQL by default.** A `.ts` migration (default-exporting an async function that takes the client) is only for what SQL can't express, such as a backfill computed in code.
3. **Forward-only.** There are no down migrations. Recovery is Neon's point-in-time restore, plus a snapshot before risky releases.
4. **Expand, then contract.** Each release's schema must work with the previous release's code, because a migration can succeed and the build then fail, and Vercel's Instant Rollback puts old code back on the current schema:
   1. Release N adds (a new column, table or index), and its code writes both the old and new shape where needed.
   2. Release N+1's code stops reading and writing the old shape. No `DROP` yet: release N's code, still live while N+1 builds or after a rollback, writes it.
   3. Release N+2 adds the `DROP`, once no live code touches the old shape.
5. **Renames** are add → backfill → switch → drop, across releases, with the drop a release after the switch (as above). Never `RENAME COLUMN` in one step.
6. **New required columns** are added nullable or with a default, backfilled, then made `NOT NULL` in a later file.
7. **Enum-like values** (types, hosts, formats) change only in their code constant. The every-deploy `syncCheckConstraints()` rebuilds their CHECKs, so they need no migration. Any change to every-deploy SQL, including a new enum value, bumps `EVERY_DEPLOY_REVISION` (a test pins the SQL to it and fails until you do). The runner records the revision and refuses an older checkout, so a stale build can't put back older functions or CHECKs that reject values newer code writes.
8. **No app imports in `.ts` migrations.** App code keeps changing and would silently change an old migration. Copy constants in instead.
9. **Test on a copy.** A pull request's preview deployment migrates its own Neon branch of production once preview migrations are set up (see [Migrating preview deployments](#migrating-preview-deployments)). Otherwise, point `.env` at a Neon branch and run `pnpm migrate` before merging.
10. **The pull request includes** the migration, updated tests (mocked-`sql` tests assert positional params, so column changes shift indexes), and an "Action needed" line if the release needs one.

`migrations/` is excluded from Prettier and ESLint, so formatting never changes a shipped file's checksum.

If a preview build fails on a checksum because a migration was edited during its pull request, reset the preview branch (Neon console → Reset from parent, or delete it) and redeploy.

## Migrating preview deployments

Preview builds skip migrations by default, so a preview runs on whatever schema its database already has. Turning on Neon's preview branches alone doesn't change that. To migrate each preview's own branch:

1. In Neon's Vercel integration, turn on a database branch for each preview deployment, so previews get their own `DATABASE_URL` instead of production's.
2. In Vercel → Project → Settings → Environment Variables, add both of these, scoped to **Preview** only:
   - `MIGRATE_PREVIEWS` = `1`
   - `PRODUCTION_DATABASE_HOST` = production's database host, as a bare hostname such as `ep-name-123.us-east-1.aws.neon.tech`. Take it from production's `DATABASE_URL`, between `@` and the next `/`. Not a URL or connection string: the build fails on one. Its `-pooler` form is fine.
3. Redeploy a preview. Its build log shows the migrations, or why it skipped them.

`pnpm migrate` runs on a preview only when both are set, and skips it when the preview's database host is production's. That's the guard against a preview without its own branch migrating production with unmerged code.

## Preview branch cleanup

The Vercel-managed Neon integration names each preview branch `preview/<git-branch>` and deletes it only when its Vercel deployments are deleted, months later by default. Neon Free allows 10 branches per project, so `.github/workflows/neon-preview-branches.yml` cleans them up:

- **On every push to a branch other than `main`**, it sets that branch's `preview/<git-branch>` to expire 7 days out. Neon deletes it if nothing is pushed for a week. On a branch's first push it waits up to 4 minutes for Vercel's build to create the Neon branch.
- **When a pull request closes** (merged or not), it deletes the pull request's `preview/<git-branch>`.

A missing Neon branch is logged and skipped, never a failure. Both jobs need two repository secrets (GitHub → Settings → Secrets and variables → Actions):

| Secret            | Value                                                                          |
| ----------------- | ------------------------------------------------------------------------------ |
| `NEON_API_KEY`    | A Neon API key (Neon console → Account settings → API keys, or an org API key) |
| `NEON_PROJECT_ID` | The Neon project's ID (Neon console → Project settings → General)              |

Without them, both jobs fail at their first Neon request.
