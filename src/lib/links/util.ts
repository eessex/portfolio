import { LinkTypes } from '@/lib/links/schemas/db'

type LinkOrderFields = {
  type?: unknown
  publishDate?: unknown
  createdAt?: unknown
  quotation?: unknown
  attribution?: unknown
}

function linkTime({ publishDate, createdAt }: LinkOrderFields) {
  const date = publishDate ?? createdAt
  // undated draft sorts as newest
  if (!date) return Infinity
  const time = new Date(date as string | Date).getTime()
  return Number.isNaN(time) ? Infinity : time
}

/** Press links with no quotation/date/attribution sort as plain links. */
function isSortedAsPress({
  type,
  quotation,
  publishDate,
  attribution
}: LinkOrderFields) {
  return (
    type === LinkTypes.press &&
    !!(quotation || publishDate || attribution)
  )
}

/** 0 for press links, 1 otherwise. */
export function linkOrderGroup(link: LinkOrderFields) {
  return isSortedAsPress(link) ? 0 : 1
}

/**
 * Press links first, newest first (publish date, else created date);
 * other links compare equal so a stable sort keeps their order.
 */
export function compareLinksByDefaultOrder(
  a: LinkOrderFields,
  b: LinkOrderFields
) {
  const groupDiff = linkOrderGroup(a) - linkOrderGroup(b)
  if (groupDiff !== 0) return groupDiff
  if (!isSortedAsPress(a)) return 0
  const timeA = linkTime(a)
  const timeB = linkTime(b)
  return timeA === timeB ? 0 : timeA > timeB ? -1 : 1
}

/** Press links first; stable within each group. */
export function pressLinksFirst<T extends LinkOrderFields>(
  links: T[]
) {
  return [...links].sort(
    (a, b) => linkOrderGroup(a) - linkOrderGroup(b)
  )
}
