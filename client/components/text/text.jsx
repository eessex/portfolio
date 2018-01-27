import { capitalize } from 'underscore.string'
import PropTypes from 'prop-types'
import React from 'react'
import { PlainText } from '../forms/rich_text/plain_text.jsx'

export const Text = (props) => {
    const {
      className,
      onClick,
      onChange,
      placeholder,
      text
    } = props

    return (
      <div
        className={`Text ${className ? className : 'p'}`}
        onClick={onClick ? onClick : undefined}
        data-placeholder={onClick && !text}
      >
        {onChange
          ? <PlainText
              content={text}
              placeholder={placeholder}
              className='EditText'
              onChange={(value) => onChange(value)}
            />

          : text
            ? text

            : placeholder
              ? placeholder
              : 'Start typing'
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
