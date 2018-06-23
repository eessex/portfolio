import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Button } from 'client/components/forms/buttons/button'
import { Format } from '../format/format.jsx'

export const Formats = props => {
  const { formats, short, onClick } = props

  return (
    <FormatsContainer
      condensed={short}
      onClick={onClick && onClick}
    >
      {formats && formats.length
        ? formats.map((item, index) =>
          <Format
            key={index}
            item={item}
            short={short}
          />
        )
        : onClick && <Button text='Add Format' />
      }
    </FormatsContainer>
  )
}

export const FormatsContainer = styled.div`
  ${props => props.condensed && `
    display: flex;
    div:first-child {
      margin-right: 20px;
    }
  `}
`

Formats.propTypes = {
  formats: PropTypes.array,
  onClick: PropTypes.func,
  short: PropTypes.bool
}
