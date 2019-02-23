import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { getDate, getVenue } from 'client/utils'
import { Formats } from 'client/components/formats/formats'
import { H1, H3, H5 } from 'client/styles/text'
import { Col } from 'react-styled-flexboxgrid'

export const ItemGrid = props => {
  const {
    condensed,
    model,
    item: {
      artist,
      formats,
      images,
      title,
    }
  } = props

  const date = getDate(model, props.item)
  const venue = getVenue(props.item.venue)
  const image = images.length ? images[0] : undefined
  const hasImage = image && image.url.length > 0

  const formattedTitle = artist
    ? `${artist}: ${title || 'Missing Title'}`
    : title || 'Missing Title'

  return (
    <GridItemContainer
      xs={12}
      sm={condensed ? 4 : 6}
      lg={condensed ? 3 : 5}
      condensed={condensed}
    >
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
          <Formats formats={formats} />
        </H5>
      }
    </GridItemContainer>
  )
}

export const GridItemContainer = styled(Col)`
  margin-bottom: 4em;
  max-width: 45%;

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
  condensed: PropTypes.bool,
  item: PropTypes.object,
  model: PropTypes.string
}
