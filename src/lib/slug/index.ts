import { sql } from '@/lib/db'
import { type SlugTableName, TablesWithSlugs } from '@/lib/schemas'

export async function generateUniqueSlug(
  title: string,
  table: SlugTableName,
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
  tableName: SlugTableName,
  excludeId?: string
) {
  if (!TablesWithSlugs.includes(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`)
  }

  const result = await sql`
    SELECT EXISTS (
      SELECT 1
      FROM ${tableName}
      WHERE slug = ${slug}
      ${excludeId ? sql`AND id <> ${excludeId}` : sql``}
    ) AS exists
  `

  return result[0]?.exists ?? false
}

export function slugify(str: string, separator = '-') {
  return str
    .toString()
    .normalize('NFD') // Split accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove diacritics
    .toLowerCase() // Convert to lowercase
    .replace(/[^a-z0-9 -]/g, '') // Remove non-alphanumeric chars
    .trim() // Trim leading/trailing spaces
    .replace(/\s+/g, separator) // Replace spaces with separator
    .replace(/-+/g, separator) // Collapse consecutive separators
}

function getTableIdentifier(table: SlugTableName) {
  if (!TablesWithSlugs.includes(table)) {
    throw new Error(`Invalid table name: ${table}`)
  }

  return sql.unsafe(table)
}

type ResolveSlugResult = {
  id: string
  slug: string
  isRedirect: boolean
}

export async function resolveSlug(
  tableName: SlugTableName,
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
}
