import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

export const ItemTable = (props) => {
  const { date, title, venue } = props

  return (
    <Row className='Item ItemTable'>
      <Col sm={12} lg={3} className='Item__date'>
        <h4>{date}</h4>
      </Col>

      <Col sm={12} lg={6} className='Item__title'>
        <h4>{title || 'Missing Title'}</h4>
      </Col>

      <Col sm={12} lg={3} className='Item__venue'>
        <h4>{venue}</h4>
      </Col>
    </Row>
  )
}

ItemTable.propTypes = {
  date: PropTypes.string,
  title: PropTypes.string,
  venue: PropTypes.string
}
