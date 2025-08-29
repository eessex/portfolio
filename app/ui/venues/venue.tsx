import type { Venue } from '@/lib/definitions'

type VenueFormat = 'sm' | 'lg'

export function VenueInline ({
  venue: {
    name, address, city, country, state
  },
  format,
  isNameHidden
}: {
  venue: Omit<Venue, 'id'>,
  format?: VenueFormat,
  isNameHidden?: boolean
}) {
  if (isNameHidden) {
    return (
      <>
        {address && `${address}`}
        {address && city ? `, ${city}` : city}
        {state && `, ${state}`}
        {country && `, ${country}`}
      </>
    )
  } else if (format && format === 'sm') {
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
