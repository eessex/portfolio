import styled from 'styled-components'
import React from 'react'
import FontAwesome from 'react-fontawesome'

interface LoadingProps {
  isAbsolute: boolean
}

export const Loading = (props: LoadingProps) => {
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

const LoadingContainer = styled.div<LoadingProps>`
  position: ${props => props.isAbsolute ? 'absolute' : 'fixed'};
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  color: ${({ theme }) => theme.colors.gray};
  z-index: -1;
`
