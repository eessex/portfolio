import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

export const ItemTable = (props) => {
  const { artist, date, title, venue, publisher } = props

  return (
    <Row className='Item ItemTable'>
      {date &&
        <Col sm={12} lg={3} className='Item__date'>
          <h4>{date}</h4>
        </Col>
      }
      <Col sm={12} lg={6} className='Item__title'>
        <h4>
          {artist && `${artist}: `}
          {title || 'Missing Title'}
        </h4>
      </Col>
      {venue &&
        <Col sm={12} lg={3} className='Item__venue'>
          <h4>{venue}</h4>
        </Col>
      }
      {publisher &&
        <Col sm={12} lg={3} className='Item__venue'>
          <h4>{publisher}</h4>
        </Col>
      }
    </Row>
  )
}

ItemTable.propTypes = {
  artist: PropTypes.string,
  date: PropTypes.string,
  title: PropTypes.string,
  venue: PropTypes.string,
  publisher: PropTypes.string
}
