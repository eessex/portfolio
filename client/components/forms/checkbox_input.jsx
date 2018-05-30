import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'

export const CheckboxInput = props => {
  const {
    className,
    label,
    value,
    onChange
  } = props

  return (
    <CheckboxInputContainer className={`CheckboxInput ${className || ''}`}>
      <input
        type='checkbox'
        defaultChecked={value}
        onChange={(e) => onChange(e.target.checked)}
      />

      {label &&
        <label>{label}</label>
      }
    </CheckboxInputContainer>
  )
}

CheckboxInput.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.bool,
  onChange: PropTypes.func.isRequired
}

const CheckboxInputContainer = styled.div`
  display: flex;
  align-items: center;

  input {
    margin: 0;
  }

  label {
    padding: 0 0 0 0.5em;
  }
`
