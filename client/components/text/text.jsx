import { capitalize } from 'underscore.string'
import PropTypes from 'prop-types'
import React from 'react'

export const Text = (props) => {
    const {
      className,
      onClick,
      placeholder,
      text
    } = props

    return (
      <div
        className={`Text ${className ? className : 'p'}`}
        onClick={onClick ? onClick : undefined}
        data-placeholder={onClick && !text}
      >
        {text
          ? text

          : placeholder
            ? placeholder
            : 'Start typing'
        }
      </div>
    )
  }

Text.propTypes = {
  title: PropTypes.string,
  onClick: PropTypes.func,
  placeholder: PropTypes.string
}
