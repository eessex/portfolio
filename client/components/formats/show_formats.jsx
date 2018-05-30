import PropTypes from 'prop-types'
import React from 'react'
import { ShowFormat } from './show_format.jsx'

export const ShowFormats = (props) => {
  const { items, short, onClick } = props

  return (
    <div className='ShowFormats' data-condensed={short} onClick={onClick && onClick}>
      {items.map((item, index) =>
        <ShowFormat
          key={index}
          item={item}
          short={short}
        />
      )}
    </div>
  )
}

ShowFormats.propTypes = {
  items: PropTypes.array,
  onClick: PropTypes.func,
  short: PropTypes.bool
}
