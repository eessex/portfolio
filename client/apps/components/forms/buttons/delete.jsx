import PropTypes from 'prop-types'
import React from 'react'

export const DeleteButton = (props) => {
  const { onClick, redirectUrl } = props

  return (
    <button
      className='DeleteButton'
      onClick={() => onClick(onClick, redirectUrl)}
    >
      Delete
    </button>
  )
}

function onClick (onClick, redirectUrl) {
  onClick()
  window.location.replace(redirectUrl)
}

DeleteButton.propTypes = {
  onClick: PropTypes.func.isRequired,
  redirectUrl: PropTypes.string
}
