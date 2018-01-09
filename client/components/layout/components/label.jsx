import PropTypes from 'prop-types'
import React from 'react'

export const Label = (props) => {
  const { label, labelLink } = props

  return (
    <label className='Label'>
      {labelLink
        ? <a href={labelLink}>{label}</a>
        : label
      }
    </label>
  )
}

Label.propTypes = {
  label: PropTypes.string,
  labelLink: PropTypes.string
}
