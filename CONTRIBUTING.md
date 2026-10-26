# Contributing

## Checks

GitHub Actions runs `pnpm typecheck`, `pnpm lint` and `pnpm test:quiet` on every pull request and every push to `main` (`.github/workflows/checks.yml`). Vercel's build runs only `pnpm migrate && pnpm build`. Run `pnpm check` locally to do all of it, build included.

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
