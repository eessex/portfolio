import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import FontAwesome from 'react-fontawesome'

export const Loading = props => {
  const { isAbsolute } = props

  return (
    <LoadingContainer isAbsolute={isAbsolute}>
      <FontAwesome
        name='circle-o-notch'
        size='2x'
        spin
      />
    </LoadingContainer>
  )
}

const LoadingContainer = styled.div`
  position: ${props => props.isAbsolute ? 'absolute' : 'fixed'};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #ddd;
  z-index: -1;
`
Loading.propTypes = {
  isAbsolute: PropTypes.bool
}
