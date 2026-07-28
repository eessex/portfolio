import type { Venue } from '@/lib/venues/schemas/db'

export function VenueDetails({ venue }: { venue: Venue }) {
  return <>{venue.url && <span>{venue.url}</span>}</>
}
