import PropTypes from 'prop-types'
import React from 'react'
import { PlainText } from '../forms/rich_text/plain_text.jsx'

export const Text = props => {
  const {
    className,
    onClick,
    onChange,
    placeholder,
    text
  } = props

  return (
    <div
      className={`Text ${className || 'p'}`}
      onClick={onClick || undefined}
      data-placeholder={onClick && !text}
    >
      {onChange
        ? (
          <PlainText
            content={text}
            placeholder={placeholder}
            className='EditText'
            onChange={(value) => onChange(value)}
          />
        )
        : text || placeholder || 'Start typing'
      }
    </div>
  )
}

Text.propTypes = {
  className: PropTypes.string,
  text: PropTypes.string,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
}
