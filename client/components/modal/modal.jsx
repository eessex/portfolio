import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { ModalBackground } from './modal_background.jsx'

export const Modal = props => {
  const { children, className, onClick } = props

  return (
    <ModalContainer className={`ModalContainer ${className}`}>
      <ModalContainerInner>
        {children}
      </ModalContainerInner>
      <ModalBackground
        backgroundColor='rgba(0,0,0,.5)'
        onClick={onClick}
      />
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

Modal.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
  onClick: PropTypes.func.isRequired
}