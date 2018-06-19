import styled from 'styled-components'
import { capitalize } from 'underscore.string'
import PropTypes from 'prop-types'
import React from 'react'

export const Label = (props) => {
  const {
    label,
    labelLink,
    model
  } = props
  const formattedLabel = capitalize(label)
  let formattedModel = model ? `/${model}` : undefined

  if (model === 'publications' && label === 'Release') {
    formattedModel = '/releases'
  }

  return (
    <LabelContainer>
      {labelLink && formattedModel
        ? <a href={formattedModel}>{formattedLabel}</a>
        : formattedLabel
      }
    </LabelContainer>
  )
}

const LabelContainer = styled.label`
  font-weight: 600;
  padding-bottom: 15px;
  display: block;
  a {
    text-decoration: none;
  }
`

Label.propTypes = {
  label: PropTypes.string,
  labelLink: PropTypes.bool,
  model: PropTypes.string
}
