import styled from 'styled-components'
import { capitalize } from 'underscore.string'
import React from 'react'

interface LabelProps {
  label: string
  labelLink?: string
  model?: string
}

export const Label: React.SFC<LabelProps> = ({
  label,
  labelLink,
  model
}) => {
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
