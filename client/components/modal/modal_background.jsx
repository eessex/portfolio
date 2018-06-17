import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'

export const ModalBackground = props => {
  const { backgroundColor, onClick } = props

  return (
    <ModalBackgroundContainer
      onClick={onClick}
      backgroundColor={backgroundColor}
    />
  )
}

const ModalBackgroundContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1
  ${props => props.backgroundColor && `
    background-color: ${props.backgroundColor};
  `}
`

ModalBackground.propTypes = {
  onClick: PropTypes.func.isRequired,
  backgroundColor: PropTypes.string
}
