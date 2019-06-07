import styled from 'styled-components'
import React from 'react'
import { ModalBackground } from './ModalBackground'

interface  ModalProps {
  children: any
  onClick: () => void
}

export const Modal: React.SFC<ModalProps> = ({ children, onClick }) => {
  return (
    <ModalContainer>
      <ModalContainerInner>
        {children}
      </ModalContainerInner>
      <ModalBackground onClick={onClick} />
    </ModalContainer>
  )
}

const ModalContainer = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 100;
`

const ModalContainerInner = styled.div`
  background: white;
  border: 1px solid;
  padding: 30px;
  z-index: 10;
  width: 600px;
  max-width: 80vw;
  max-height: 78vh;
  overflow: scroll;
  label {
    font-weight: 600;
    padding-bottom: 10px;
    display: block;
  }
`
