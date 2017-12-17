import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

export const LayoutColumn = (props) => {
  const {
    className,
    children,
    label,
    labelLink,
    layout
  } = props

  return (
    <Row
      className={`LayoutColumn ${className || ''}`}
      data-layout={layout || ''}
    >
      {label &&
        <Col
          className='LayoutColumn__title'
          xs={12}
          sm={2}
        >
          {labelLink
           ? <a href={labelLink}>{label}</a>
           : label
          }
        </Col>
      }
      <Col
        className='LayoutColumn__body'
        smOffset={!label ? 2 : 0}
        xs={12}
        sm={7}
      >
        {children}
      </Col>
    </Row>
  )
}

LayoutColumn.propTypes = {
  className: PropTypes.string
}
