import PropTypes from 'prop-types'
import React from 'react'
import { ModalBackground } from './modal_background.jsx'

export const ModalContainer = props => {
  const { children, className, onClick } = props

  return (
    <div className={`ModalContainer ${className}`}>
      <div className='ModalContainer__inner'>
        {children}
      </div>
      <ModalBackground
        backgroundColor='rgba(0,0,0,.5)'
        onClick={onClick}
      />
    </div>
  )
}

ModalContainer.propTypes = {
  className: PropTypes.string,
  children: PropTypes.any.isRequired,
  onClick: PropTypes.func.isRequired
}
