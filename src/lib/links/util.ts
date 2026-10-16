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

/**
 * The tier a link renders in, and the drag group it stays in: 0 for
 * quoted press links, 1 for other press links, 2 otherwise. `LinksList`
 * renders each tier as its own list, so a saved order that crossed
 * tiers couldn't be shown — the picker keeps chips within theirs.
 */
export function linkOrderGroup(link: LinkOrderFields) {
  if (!isSortedAsPress(link)) return 2
  return link.quotation ? 0 : 1
}

/**
 * Press links first: quoted ones, then the rest, each newest first
 * (publish date, else created date); other links compare equal so a
 * stable sort keeps their order.
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

/**
 * Quoted press links, then other press links, then the rest (see
 * `linkOrderGroup`); stable within each group.
 */
export function pressLinksFirst<T extends LinkOrderFields>(
  links: T[]
) {
  return [...links].sort(
    (a, b) => linkOrderGroup(a) - linkOrderGroup(b)
  )
}

/**
 * Whether a link belongs in the Press picker rather than Links. Unlike
 * `linkOrderGroup`, by type alone: an undated, unquoted press link is
 * still edited as press, though it renders with the plain links.
 */
export function isPressLink(link: { type?: unknown }) {
  return link.type === LinkTypes.press
}
