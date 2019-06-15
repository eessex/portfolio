import { stripTags } from 'underscore.string'
import styled from 'styled-components'
import React from 'react'
import { RichText } from 'client/components/text/draft/RichText'
import { P } from 'client/styles/text'

interface DescriptionProps {
  description?: string
  fieldName?: string
  onChange: (key: string, val: any) => void
  placeholder?: string
}

export const Description: React.SFC<DescriptionProps> = props => {
  const {
    description,
    onChange,
    placeholder,
    fieldName
  } = props
  const hasDescription = stripTags(description).length > 0
  const key = fieldName || 'description'

  return (
    <DescriptionContainer>
      {onChange
        ? (
          <P>
            <RichText
              html={description}
              placeholder={placeholder || 'Start typing...'}
              onChange={(value) => onChange(key, value)}
            />
          </P>
        ) : hasDescription && <P dangerouslySetInnerHTML={{__html: description}} />
      }
    </DescriptionContainer>
  )
}

export const DescriptionContainer = styled.div`
  ${P} {
    margin-bottom: 1em;
  }
`
