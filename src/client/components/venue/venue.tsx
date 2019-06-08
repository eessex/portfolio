import styled from 'styled-components'
import React from 'react'
import { Placeholder } from 'client/styles/forms'
import { Venue as VenueType } from 'client/typings'

export interface VenueProps {
  onClick?: () => void
  venue?: VenueType
}

export const Venue: React.SFC<VenueProps> = ({onClick, venue = {}}) => {
  const { address, city, country, state, name } = venue
  const hasVenue = venue && (venue.name || venue.address)

  return (
    <VenueContainer onClick={onClick || undefined}>
      {name &&
        <div>{name}</div>
      }
      {address &&
        <div>{address}</div>
      }
      {hasVenue && (city || state || country) &&
        <div>
          {city}
          {state && city ? ', ' + state : state}
          {(state || city) && country ? ' ' + country : country}
        </div>
      }
      {!hasVenue && onClick &&
        <Placeholder>Add Venue</Placeholder>
      }
    </VenueContainer>
  )
}

export const VenueContainer = styled.div`
  position: relative
`
