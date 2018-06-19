import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { RichText } from '../../forms/rich_text/index.jsx'
import { P } from '../../../styles/text.jsx'

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
