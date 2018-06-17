import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Placeholder } from '../../styles/forms.jsx '

export const Venue = props => {
  const { onClick, venue } = props
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

const VenueContainer = styled.div`
  position: relative
`

Venue.propTypes = {
  onClick: PropTypes.func,
  venue: PropTypes.shape({
    address: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    name: PropTypes.string,
    state: PropTypes.string
  })
}
