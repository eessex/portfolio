---
name: verify
description: Verify a change in this repo end-to-end — tests (create if missing), lint, typecheck, and driving the app in the dev server. Run after any nontrivial change to product code.
---

# Verifying changes in portfolio-cms

Run through ALL of these after any nontrivial change. Do not skip a
step because the change "looks safe" — report which steps ran and
their actual results, and say explicitly if one failed or was skipped.

## 1. Tests

- Every changed module in `src/lib/<domain>/` or `src/ui/` should
  have a colocated `*.test.ts(x)`. If the file you changed has none,
  create one — build inputs with the domain's `fixtures.ts` builders
  and the shared helpers in `src/test/helpers.ts` (`mockFile`,
  `formDataFromObject`).
- Run tests related to the change first:
  `NODE_OPTIONS=--no-deprecation npx jest src/lib/<domain>/`
- Run the full suite (`pnpm test`) when the change touches shared
  code: `src/lib/schemas/`, `src/lib/util.ts`, `src/lib/strings.ts`,
  `src/lib/types.ts`, or anything imported across domains.
- Update tests whose expected behavior legitimately changed; never
  weaken or delete assertions just to make them pass.

## 2. Static checks

- `pnpm lint`
- `pnpm typecheck`
- Prettier runs automatically via a PostToolUse hook on every
  Edit/Write — only run `pnpm prettier` manually for files produced
  by scripts or codegen.

## 3. Drive the app

- Check whether the dev server is already up before starting one:
  `curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 --max-time 3`
  If not running, start `pnpm dev` in the background and wait for
  the ready line.
- The server needs `.env` with a working `DATABASE_URL` (present
  locally; see CONTRIBUTING.md → Getting started for a fresh
  machine).
- **The dev server sometimes talks to the real Neon database.** Reads are
  fine. Do not exercise create/update/delete server actions against
  it unless the user explicitly asks.
- Smoke-check the routes the change affects: `/`, `/releases`,
  `/events`, `/projects`, `/about`, and the `/api/<domain>` JSON
  endpoints. Expect 200s and plausible content, not just "it
  responded".
- Authed flows: `/login` needs real credentials you do not have.
  Verify authed behavior through unit tests plus the unauthed
  boundary — e.g. `/dashboard` and `/*/new` redirect to `/login`,
  and unpublished (`is_published = false`) rows are absent from
  public pages and API responses.
- Pages use `'use cache'` with tag invalidation — if a page looks
  stale after a data change, suspect a missing/wrong `updateTag`
  before suspecting the query.
- For visual changes, use the Claude Preview MCP tools
  (`preview_screenshot`) instead of inferring appearance from code.
