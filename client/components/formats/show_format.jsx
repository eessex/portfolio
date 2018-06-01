import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'

export const ShowFormat = props => {
  const { item, short, onClick } = props
  const {
    format,
    publisher,
    release_year
  } = item
  const formattedFormat = format && (publisher || (release_year && !short))
    ? `${format}, `
    : format
  const formattedPublisher = release_year && !short ? `${publisher}, ` : publisher

  return (
    <FormatContainer
      className='ShowFormat'
      onClick={onClick && onClick}
      short={short}
    >
      {formattedFormat}
      {publisher && formattedPublisher}
      {!short && release_year}
    </FormatContainer>
  )
}

const FormatContainer = styled.div`
  margin-bottom: .35em;
  ${props => props.short && `
    margin-bottom: 0;
  `}
`

ShowFormat.propTypes = {
  item: PropTypes.object,
  short: PropTypes.bool,
  onClick: PropTypes.func
}
