import PropTypes from 'prop-types'
import React, { Component } from 'react'

export const Modal = (props) => {
  const { backgroundColor, onClick } = props

  return (
    <div
      className='Modal'
      onClick={onClick}
      style={{ backgroundColor }}
    />
  )
}

Modal.propTypes = {
  onClick: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string
}
