import PropTypes from 'prop-types'
import React from 'react'
import { PlainText } from 'client/components/forms/rich_text/plain_text'

export const Text = props => {
  const {
    onClick,
    onChange,
    placeholder,
    text
  } = props

  return (
    <div
      onClick={onClick || undefined}
      data-placeholder={onClick && !text}
    >
      {onChange
        ? (
          <PlainText
            content={text}
            placeholder={placeholder}
            onChange={(value) => onChange(value)}
          />
        )
        : text || placeholder || 'Start typing'
      }
    </div>
  )
}

Text.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
}
