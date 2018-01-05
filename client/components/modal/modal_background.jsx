import PropTypes from 'prop-types'
import React, { Component } from 'react'

export const ModalBackground = (props) => {
  const { backgroundColor, onClick } = props

  return (
    <div
      className='Modal'
      onClick={onClick}
      style={{ backgroundColor }}
    />
  )
}

ModalBackground.propTypes = {
  onClick: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string
}
