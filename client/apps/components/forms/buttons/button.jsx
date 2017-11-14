import FontAwesome from 'react-fontawesome'
import PropTypes from 'prop-types'
import React from 'react'

export const Button = (props) => {
  const {
    borderless,
    color,
    icon,
    onClick,
    text
  } = props
  const className = icon ? ' IconButton' : ''

  return (
    <button
      className={'Button' + className}
      onClick={onClick}
      style={{
        borderWidth: borderless ? '0' : '1px',
        color
      }}
    >
      {icon &&
        <FontAwesome name={icon} />
      }
      {text}
    </button>
  )
}

Button.propTypes = {
  borderless: PropTypes.bool,
  color: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func.isRequired,  
  text: PropTypes.string
}
