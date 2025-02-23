import { Venue } from '@/lib/definitions'

export function VenueInline ({ venue: { name, address, city, country, state } }: { venue: Omit<Venue, 'id'> }) {
  return (
    <>
      {name && `${name}: `}
      {address && `${address}`}
      {address && city ? `, ${city}` : city}
      {state && `, ${state}`}
      {country && `, ${country}`}
    </>
  )
}
