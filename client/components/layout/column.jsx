import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

export const LayoutColumn = (props) => {
  const {
    className,
    children,
    layout
  } = props

  return (
    <Row className='LayoutColumn' data-layout={layout || ''}>
      <Col className={`LayoutColumn__body ${className || ''}`} xs={12} sm={7}>
        {children}
      </Col>
    </Row>
  )
}

LayoutColumn.propTypes = {
  className: PropTypes.string
}
