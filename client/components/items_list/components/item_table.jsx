import styled from 'styled-components'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Formats, FormatsContainer } from '../../formats/formats.jsx'

export const ItemTable = (props) => {
  const { artist, date, formats, title, venue } = props

  return (
    <TableItem>
      {date &&
        <Col xs={12} lg={3}>
          <h4>{date}</h4>
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
          <h4>{venue}</h4>
        </Col>
      }
      {formats && formats.length &&
        <Col xs={12} lg={3}>
          <h4>
            <Formats items={formats} short />
          </h4>
        </Col>
      }
    </TableItem>
  )
}

const Title = styled.h4`
  @media (max-width: 76em) {
    max-width: 100%;
    font-size: 1.3em;
    line-height: 1.3em;
  }
`

const TableItem = Row.extend`
  margin-left: 0;
  margin-right: 0;
  padding: .5em 20px !important;

  ${Col} {
    padding-left: 0 !important;
    padding-right: 0 !important;
  }

  @media (max-width: 76rem) {
    ${FormatsContainer} {
      flex-direction: column;
    }
  }
`

ItemTable.propTypes = {
  artist: PropTypes.string,
  date: PropTypes.string,
  formats: PropTypes.array,
  title: PropTypes.string,
  venue: PropTypes.string
}
