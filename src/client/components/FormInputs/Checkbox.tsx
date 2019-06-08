import React from 'react'
import styled from 'styled-components'
import { H5 } from 'client/styles/text'

interface CheckboxProps {
  label?: string
  value: boolean
  onChange: (val: boolean) => void
}

export const Checkbox: React.SFC<CheckboxProps> = ({
  label,
  value,
  onChange
}) => {
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
