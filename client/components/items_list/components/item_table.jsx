import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Formats } from '../../formats/formats.jsx'

export const ItemTable = (props) => {
  const { artist, date, formats, title, venue } = props

  return (
    <Row className='Item ItemTable'>
      {date &&
        <Col xs={12} lg={3} className='Item__date'>
          <h4>{date}</h4>
        </Col>
      }
      <Col xs={12} lg={6} className='Item__title'>
        <h4>
          {artist && `${artist}: `}
          {title || 'Missing Title'}
        </h4>
      </Col>
      {venue &&
        <Col xs={12} lg={3} className='Item__venue'>
          <h4>{venue}</h4>
        </Col>
      }
      {formats && formats.length &&
        <Col xs={12} lg={3} className='Item__formats'>
          <h4>
            <Formats items={formats} short />
          </h4>
        </Col>
      }
    </Row>
  )
}

ItemTable.propTypes = {
  artist: PropTypes.string,
  date: PropTypes.string,
  formats: PropTypes.array,
  title: PropTypes.string,
  venue: PropTypes.string
}
