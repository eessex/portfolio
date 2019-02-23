import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { getDate, getVenue } from 'client/utils'
import { Formats, FormatsContainer } from 'client/components/formats/formats'
import { H4 } from 'client/styles/text'

export const ItemTable = props => {
  const {
    model,
    item: {
      artist, formats, title
    }
  } = props

  const date = getDate(model, props.item)
  const venue = getVenue(props.item.venue)

  return (
    <TableItem>
      {date &&
        <Col xs={12} lg={3}>
          <H4>{date}</H4>
        </Col>
      }
      <Col xs={12} lg={6}>
        <Title>
          {artist && `${artist}: `}
          {title || 'Missing Title'}
        </Title>
      </Col>
      {venue &&
        <Col xs={12} lg={3}>
          <H4>{venue}</H4>
        </Col>
      }
      {formats && formats.length &&
        <Col xs={12} lg={3}>
          <H4>
            <Formats formats={formats} short />
          </H4>
        </Col>
      }
    </TableItem>
  )
}

const Title = H4.extend`
  @media (max-width: 76em) {
    max-width: 100%;
    font-size: 1.3em;
    line-height: 1.3em;
  }
`

const TableItem = Row.extend`
  margin-left: 0;
  margin-right: 0;
  padding: 12px 20px;

  ${Col} {
    padding-left: 0;
    padding-right: 0;
  }

  @media (max-width: 76rem) {
    ${FormatsContainer} {
      flex-direction: column;
    }
  }
`

ItemTable.propTypes = {
  item: PropTypes.object,
  model: PropTypes.string,
}
