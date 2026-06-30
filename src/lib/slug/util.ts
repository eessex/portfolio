import { sql } from '@/lib/db'
import { type SlugTableName, TablesWithSlugs } from '@/lib/schemas'

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

export function getTableIdentifier(table: SlugTableName) {
  if (!TablesWithSlugs.includes(table)) {
    throw new Error(`Invalid table name: ${table}`)
  }

  return sql.unsafe(table)
}
