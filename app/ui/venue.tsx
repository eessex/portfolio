import { Venue } from '@/lib/definitions'

type VenueFormat = 'sm' | 'lg'

export function VenueInline ({
  venue: {
    name, address, city, country, state
  },
  format,
}: {
  venue: Omit<Venue, 'id'>,
  format?: VenueFormat
}) {
  if (format && format === 'sm') {
    return (
      <>
        {name && `${name}: `}
        {city && ` ${city}`}
        {state && `, ${state}`}
        {country && `, ${country}`}
      </>
    )
  } else {
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
}
