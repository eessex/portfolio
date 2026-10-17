import { emptyListFieldName } from '@/lib/item-fields'
import { publishedEditionDraftSchema } from '@/lib/published-editions/schemas/db'
import {
  extractIndexedGroups,
  type IndexedGroupEntry,
  isBlankEntry,
  normalizeFormData
} from '@/lib/util'

export const PUBLISHED_EDITIONS_FIELD = 'publishedEditions'

/**
 * A release form's submitted edition entries, minus untouched blank
 * create forms, or `undefined` when the picker wasn't submitted at all
 * (so a partial update leaves the release's editions alone). Strips
 * the entries' keys from `data`.
 */
export function extractPublishedEditionEntries(
  data: Record<string, unknown>
): IndexedGroupEntry[] | undefined {
  if (!(emptyListFieldName(PUBLISHED_EDITIONS_FIELD) in data)) {
    return undefined
  }
  return extractIndexedGroups(data, PUBLISHED_EDITIONS_FIELD).filter(
    (entry) => entry.kind !== 'new' || !isBlankEntry(entry.fields)
  )
}

/**
 * Why a submitted edition can't be saved, if it can't: checked for
 * every edition before the release is written, so one bad edition
 * doesn't leave a half-saved release.
 */
export function publishedEditionEntryError(
  entry: IndexedGroupEntry,
  position: number
): string | undefined {
  if (entry.kind === 'existing') return undefined
  const parsed = publishedEditionDraftSchema.safeParse(
    normalizeFormData(entry.fields)
  )
  if (parsed.success) return undefined

  const fields = new Set(
    parsed.error.issues.map((issue) => String(issue.path[0]))
  )
  const isMissingPublisher = fields.delete('publisherId')
  const problems = [
    fields.size && `has an invalid ${[...fields].join(', ')}`,
    isMissingPublisher && 'needs a publisher'
  ].filter(Boolean)
  return `Edition ${position + 1} ${problems.join(' and ')}.`
}

/** Earliest first; drafts' dates arrive as input strings. */
export function comparePublishedEditionsByDate(
  a: Record<string, unknown>,
  b: Record<string, unknown>
) {
  return toTime(a.publishDate) - toTime(b.publishDate)
}

function toTime(value: unknown) {
  if (!(typeof value === 'string' || value instanceof Date)) {
    return Infinity
  }
  const time = new Date(value).getTime()
  return Number.isNaN(time) ? Infinity : time
}
