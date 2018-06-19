import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { RichText } from 'client/components/forms/rich_text'
import { P } from 'client/styles/text'

export const Description = props => {
  const {
    description,
    onChange,
    placeholder
  } = props

  return (
    <DescriptionContainer>
      {onChange
        ? (
          <P>
            <RichText
              html={description}
              placeholder={placeholder || 'Start typing...'}
              onChange={(value) => onChange('description', value)}
            />
          </P>
        ) : <P dangerouslySetInnerHTML={{__html: description}} />
      }
    </DescriptionContainer>
  )
}

export const DescriptionContainer = styled.div`
  margin-bottom: 1em;
`

Description.propTypes = {
  description: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string
}
