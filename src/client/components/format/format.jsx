import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'

export const Format = props => {
  const { item, isShort, onClick } = props
  const {
    format,
    publisher,
    release_year
  } = item

  const formattedFormat = format && (publisher || (release_year && !isShort))
    ? `${format}, `
    : format
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

export const FormatContainer = styled.div`
  margin-bottom: .35em;
  ${props => props.isShort && `
    margin-bottom: 0;
  `}
`

Format.propTypes = {
  item: PropTypes.object,
  isShort: PropTypes.bool,
  onClick: PropTypes.func
}
