import { cache } from 'react'

import { sql } from '@/lib/db'
import type { PagePath } from '@/lib/schemas'
import { getTableIdentifier, slugify } from '@/lib/slug/util'

export async function generateUniqueSlug(
  title: string,
  table: PagePath,
  existingRowId?: string
): Promise<string> {
  const slugBase = slugify(title) || 'untitled'

  let slug = slugBase
  let counter = 2

  while (await slugExists(slug, table, existingRowId)) {
    slug = `${slugBase}-${counter}`
    counter++
  }

  return slug
}
async function slugExists(
  slug: string,
  tableName: PagePath,
  excludeId?: string
) {
  const table = getTableIdentifier(tableName)
  const excludeClause = excludeId
    ? sql`AND id <> ${excludeId}`
    : undefined
  const result = await sql`
    SELECT EXISTS (
      SELECT 1
      FROM ${table}
      WHERE slug = ${slug}
      ${excludeClause}
    ) AS exists
  `

  return result[0]?.exists ?? false
}

type ResolveSlugResult = {
  id: string
  slug: string
  isRedirect: boolean
}

/**
 * Wrapped in React's `cache()` so repeated calls with the same args within
 * a single request (e.g. from `generateMetadata` and the page body) share
 * one DB lookup instead of resolving the slug twice.
 */
export const resolveSlug = cache(async function resolveSlug(
  tableName: PagePath,
  slug: string
): Promise<ResolveSlugResult | null> {
  const table = getTableIdentifier(tableName)

  // Current slug
  const current = await sql`
    SELECT id, slug
    FROM ${table}
    WHERE slug = ${slug}
    LIMIT 1
  `

  if (current[0]) {
    return {
      id: current[0].id,
      slug: current[0].slug,
      isRedirect: false
    }
  }

  // Historical slug redirects
  const previous = await sql`
    SELECT t.id, t.slug
    FROM slug_history h
    JOIN ${table} AS t
      ON t.id = h.row_id
    WHERE h.table_name = ${tableName}
      AND h.old_slug = ${slug}
    ORDER BY h.created_at DESC
    LIMIT 1
  `

  if (previous[0]) {
    return {
      id: previous[0].id,
      slug: previous[0].slug,
      isRedirect: true
    }
  }

  // 404: redirect to index
  return null
})
