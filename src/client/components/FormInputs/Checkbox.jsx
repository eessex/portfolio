import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { H5 } from 'client/styles/text'

export const Checkbox = props => {
  const { label, value, onChange } = props

  return (
    <CheckboxInputContainer>
      <input
        type='checkbox'
        defaultChecked={value}
        onChange={e => onChange(e.target.checked)}
      />

      {label &&
        <H5>{label}</H5>
      }
    </CheckboxInputContainer>
  )
}

Checkbox.propTypes = {
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

  ${H5} {
    padding: 0 0 0 0.5em;
  }
`
