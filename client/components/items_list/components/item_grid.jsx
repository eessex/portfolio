import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Formats } from '../../formats/formats.jsx'

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
  const titleClass = hasImage ? ' h3' : ' h1'

  return (
    <GridItem condensed={condensed}>
      {hasImage &&
        <img
          src={image.url}
          width='100%'
        />
      }
      <div>
        <div className={titleClass}>
          {artist && `${artist}: `}
          {title || 'Missing Title'}
        </div>
        {date && !formats &&
          <h5>
            {date}
          </h5>
        }
        {venue &&
          <h5>
            {venue}
          </h5>
        }
        {formats && formats.length &&
          <h5>
            <Formats items={formats} />
          </h5>
        }
        {description &&
          <p>
            {description}
          </p>
        }
      </div>
    </GridItem>
  )
}

const GridItem = styled.div`
  margin-bottom: 4em;
  padding: 10px 0;
  .h1 {
    font-size: 4.25em;
  }
  img {
    max-height: 80vh;
    width: auto;
    max-width: 100%;
  }

  ${props => props.condensed === true && `
    margin-top: 30px;
    margin-bottom: 50px;
    padding: 0 10px;
    .h1 {
      font-size: 2.5em;
    }
    .h3 {
      margin-bottom: .5em;
    }
    @media (max-width: 76rem) {
      margin-top: 10px;
      margin-bottom: 30px;
      padding: 10px 20px;
    }
  `}

  @media (max-width: 76rem) {
    .h1 {
      font-size: 3.25em;
    }
    h4 {
      font-size: 1.3em;
      line-height: 1.3em;
    }
  }
`

ItemGrid.propTypes = {
  artist: PropTypes.string,
  date: PropTypes.string,
  description: PropTypes.string,
  formats: PropTypes.array,
  image: PropTypes.object,
  title: PropTypes.string,
  venue: PropTypes.string
}
