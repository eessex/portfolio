import PropTypes from 'prop-types'
import React from 'react'

export const Venue = (props) => {
  const { className, onClick, venue } = props
  const { address, city, country, state, name } = venue

  return (
    <div
      className={`Venue ${className || ''}`} onClick={onClick}>
        {name && 
          <div>{name}</div>
        }
        {address &&
          <div>{address}</div>
        }
        {(city || state || country) &&
          <div>
            {city}
            {state && city ? ', ' + state : state}
            {(state || city) && country ? ' ' + country : country}
          </div>
        }
    </div>
  )
}

Venue.propTypes = {
  className: PropTypes.string,
  venue: PropTypes.object,
  onClick: PropTypes.func,
}
