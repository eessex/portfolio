import type { Venue } from '@/lib/venues/schemas/db'

export function formatVenueInline({
  venue,
  format,
  isNameHidden
}: {
  venue: Partial<Venue>
  format?: 'sm' | 'lg'
  isNameHidden?: boolean
}): string {
  if (!venue) return ''
  const parts: string[] = []

  if (isNameHidden) {
    if (venue.address) parts.push(venue.address)
    if (venue.city) parts.push(venue.city)
    if (venue.state) parts.push(venue.state)
    if (venue.country) parts.push(venue.country)
    return parts.join(', ')
  }

  if (format === 'sm') {
    if (venue.name) {
      parts.push(`${venue.name}:`)
    } else if (venue.address) {
      parts.push(venue.address)
    }
    if (venue.city) parts.push(venue.city)
    if (venue.state) parts.push(venue.state)
    if (venue.country) parts.push(venue.country)
    return parts.join(', ').replace(':,', ':').trim()
  }

  if (venue.name) parts.push(`${venue.name}:`)
  if (venue.address) parts.push(venue.address)
  if (venue.city) parts.push(venue.city)
  if (venue.state) parts.push(venue.state)
  if (venue.country) parts.push(venue.country)
  return parts.join(', ').replace(':,', ':').trim()
}
