import PropTypes from 'prop-types'
import React from 'react'
import { capitalize } from 'underscore.string'
import { PlainText } from '../../../../components/forms/rich_text/plain_text.jsx'

export const EditText = (props) => {
  const { className, label, name, value, onChange } = props

  return (
    <div className={`EditText Edit${capitalize(name)}`}>
      <label>{capitalize(name)}</label>
      <PlainText
        content={value}
        placeholder={`${capitalize(label.slice(0,-1))} ${name}`}
        className={`Publication__${name} ${className}`}
        onChange={(value) => onChange(name, value)}
      />
    </div>
  )
}

EditText.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string.isRequired,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired
}
