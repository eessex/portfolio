import FontAwesome from 'react-fontawesome'
import PropTypes from 'prop-types'
import React from 'react'

export const Button = (props) => {
  const {
    borderless,
    children,
    className,
    color,
    icon,
    onClick,
    text
  } = props
  const formatClassName = icon ? ` IconButton ${className}` : ` ${className}`
  const child = text ? text : children

  return (
    <button
      className={'Button' + formatClassName}
      onClick={onClick}
      style={{
        borderWidth: borderless ? '0' : '1px',
        color
      }}
    >
      {icon &&
        <FontAwesome name={icon} />
      }
      {child &&
        <span className='Button__text'>{child}</span>
      }
      {text && children && children}
    </button>
  )
}

Button.propTypes = {
  borderless: PropTypes.bool,
  children: PropTypes.any,
  className: PropTypes.string,
  color: PropTypes.string,
  icon: PropTypes.string,
  onClick: PropTypes.func,
  text: PropTypes.string
}
