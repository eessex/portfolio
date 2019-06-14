import styled from 'styled-components'
import React from 'react'
import { Format as FormatType } from 'client/typings'

interface FormatProps {
  format: FormatType
  isShort?: boolean
  onClick?: () => void
}

export const Format: React.SFC<FormatProps> = props => {
  const { format, isShort, onClick } = props
  const {
    publisher,
    release_year
  } = format

  const formattedFormat = format.format && (publisher || (release_year && !isShort))
    ? `${format.format}, `
    : format.format
  const formattedPublisher = release_year && !isShort ? `${publisher}, ` : publisher

  return (
    <FormatContainer
      onClick={onClick && onClick}
      isShort={isShort}
    >
      {formattedFormat}
      {publisher && formattedPublisher}
      {!isShort && release_year}
    </FormatContainer>
  )
}

export const FormatContainer = styled.div<{ isShort?: boolean }>`
  margin-bottom: .35em;

  ${({ isShort }) => isShort && `
    margin-bottom: 0;
  `}
`
