import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Formats } from '../../formats/formats.jsx'
import { H1, H3, H5 } from '../../../styles/text.jsx'

export const ItemGrid = props => {
  const {
    artist,
    condensed,
    date,
    description,
    formats,
    image,
    title,
    venue
  } = props
  const hasImage = image && image.url.length
  const formattedTitle = artist
    ? `${artist}: ${title || 'Missing Title'}`
    : title || 'Missing Title'

  return (
    <GridItem condensed={condensed}>
      {hasImage &&
        <img src={image.url} />
      }
      {hasImage
        ? <H3>{formattedTitle}</H3>
        : <H1>{formattedTitle}</H1>
      }
      {date && !formats &&
        <H5>
          {date}
        </H5>
      }
      {venue &&
        <H5>
          {venue}
        </H5>
      }
      {formats && formats.length &&
        <H5>
          <Formats items={formats} />
        </H5>
      }
      {description &&
        <p>
          {description}
        </p>
      }
    </GridItem>
  )
}

const GridItem = styled.div`
  margin-bottom: 4em;

  ${H1} {
    font-size: 3.5em;
    margin-top: 0;
    ${props => props.condensed && `
      font-size: 2.5em;
    `}
  }

  ${H3} {
    ${props => props.condensed && `
      margin-bottom: .5em;
      font-size: 1.25em;
    `}
  }

  img {
    max-height: 80vh;
    width: 100%;
    max-width: 100%;
    object-fit: cover;
    object-position: center;
  }

  ${props => props.condensed && `
    margin-top: 20px;
    margin-bottom: 50px;
    padding: 0 10px;
    @media (max-width: 76rem) {
      margin-top: 10px;
      margin-bottom: 30px;
      padding: 10px 20px;
    }
  `}

  @media (max-width: 76rem) {
    ${H1} {
      font-size: 2.25em;
    }
  }
`

ItemGrid.propTypes = {
  artist: PropTypes.string,
  condensed: PropTypes.bool,
  date: PropTypes.string,
  description: PropTypes.string,
  formats: PropTypes.array,
  image: PropTypes.object,
  title: PropTypes.string,
  venue: PropTypes.string
}
