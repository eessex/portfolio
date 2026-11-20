import { readdir } from 'node:fs/promises'

import type { Sql } from '../migrate-mongo/plan'
import { collections } from '../migrate-mongo/transforms'

export interface Preflight {
  errors: string[]
  warnings: string[]
}

/** Collection files the import reads that the folder holds. */
export async function exportFiles(dir: string) {
  let names: string[]
  try {
    names = await readdir(dir)
  } catch {
    return []
  }
  return collections
    .map((c) => `${c}.json`)
    .filter((file) => names.includes(file))
}

/** The database host, so the person can see which site they target. */
export function databaseHost(url: string) {
  try {
    return new URL(url).hostname
  } catch {
    return undefined
  }
}

export async function checkDatabase(sql: Sql): Promise<Preflight> {
  const errors: string[] = []
  const warnings: string[] = []

  const [{ t: legacyTable }] = (await sql`
    SELECT to_regclass('legacy_ids') AS t
  `) as { t: string | null }[]
  if (!legacyTable) {
    errors.push(
      'The database has no tables yet. Connect Neon in Vercel and redeploy once (or run pnpm migrate), then try again.'
    )
    return { errors, warnings }
  }

  // rows not made by an earlier import: an import adds beside them
  const [row] = (await sql`
    SELECT
      (SELECT count(*) FROM users)::int AS users,
      (SELECT count(*) FROM legacy_ids)::int AS imported,
      (
        (SELECT count(*) FROM events e WHERE NOT EXISTS (
          SELECT 1 FROM legacy_ids l
          WHERE l.table_name = 'events' AND l.row_id = e.id))
        + (SELECT count(*) FROM releases r WHERE NOT EXISTS (
          SELECT 1 FROM legacy_ids l
          WHERE l.table_name = 'releases' AND l.row_id = r.id))
        + (SELECT count(*) FROM projects p
          WHERE NOT p.is_default_project AND NOT EXISTS (
            SELECT 1 FROM legacy_ids l
            WHERE l.table_name = 'projects' AND l.row_id = p.id))
      )::int AS other_items
  `) as { users: number; imported: number; other_items: number }[]

  if (row.users === 0) {
    errors.push(
      'Nobody has claimed this site yet. Finish the /setup page first (docs/SETUP.md, "Claim your site"), then run this again.'
    )
  }
  if (row.imported > 0) {
    warnings.push(
      `${row.imported} rows came from an earlier import. Running again only adds what's missing, so it's safe.`
    )
  }
  if (row.other_items > 0) {
    warnings.push(
      `The site already has ${row.other_items} event(s), release(s) or project(s) of its own. The import adds the old site's beside them, and skips an old item whose slug is already taken (the dry-run report lists these).`
    )
  }
  return { errors, warnings }
}
