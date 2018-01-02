import PropTypes from 'prop-types'
import React from 'react'
import { capitalize } from 'underscore.string'
import { PlainText } from '../../../../components/forms/rich_text/plain_text.jsx'

export const EditText = (props) => {
  const { className, name, value, onChange } = props

  return (
    <div className={`Edit${capitalize(name)}`}>
      <label>{capitalize(name)}</label>
      <PlainText
        content={value}
        placeholder={`Publication ${name}`}
        className={`Publication__${name} ${className}`}
        onChange={(value) => onChange(name, value)}
      />
    </div>
  )
}

EditText.propTypes = {
  className: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
}
