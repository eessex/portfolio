import styled from 'styled-components'
import React from 'react'

interface ModalBackgroundProps {
  backgroundColor?: string 
  onClick: () => void
}
export const ModalBackground: React.SFC<ModalBackgroundProps> = ({
  backgroundColor,
  onClick
}) => {
  return (
    <ModalBackgroundContainer
      onClick={onClick}
      backgroundColor={backgroundColor}
    />
  )
}

export const ModalBackgroundContainer = styled.div<ModalBackgroundProps>`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 1
  ${({ backgroundColor }) => `
    background-color: ${backgroundColor || 'rgba(0,0,0,.5)'};
  `}
`
