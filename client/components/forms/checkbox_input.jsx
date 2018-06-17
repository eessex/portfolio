import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { H5 } from '../../styles/text.jsx'

export const CheckboxInput = props => {
  const {
    label,
    value,
    onChange
  } = props

  return (
    <CheckboxInputContainer>
      <input
        type='checkbox'
        defaultChecked={value}
        onChange={(e) => onChange(e.target.checked)}
      />

      {label &&
        <H5>{label}</H5>
      }
    </CheckboxInputContainer>
  )
}

CheckboxInput.propTypes = {
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
