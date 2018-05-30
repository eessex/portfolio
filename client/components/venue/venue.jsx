import PropTypes from 'prop-types'
import React from 'react'

export const Venue = props => {
  const { className, onClick, venue } = props
  const { address, city, country, state, name } = venue
  const hasVenue = venue && (venue.name || venue.address)

  return (
    <div
      className={`Venue ${className || ''}`}
      onClick={onClick || undefined}
    >
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
        <div className='placeholder'>Add Venue</div>
      }
    </div>
  )
}

Venue.propTypes = {
  className: PropTypes.string,
  onClick: PropTypes.func,
  venue: PropTypes.shape({
    address: PropTypes.string,
    city: PropTypes.string,
    country: PropTypes.string,
    name: PropTypes.string,
    state: PropTypes.string
  })
}
