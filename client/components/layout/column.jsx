import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'

export const LayoutColumn = (props) => {
  const {
    body,
    className,
    children,
    footer,
    header,
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
          className='LayoutColumn__label'
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
        className='LayoutColumn__item'
        smOffset={!label ? 2 : 0}
        xs={12}
        sm={6}
      > 
        {header &&
          <div className='LayoutColumn__header'>
            {header && header()}
          </div>
        }

        {body &&
          <div className='LayoutGrid__body'>
            {body()}
          </div>
        }

        {footer &&
          <div className='LayoutGrid__footer'>
            {footer()}
          </div>
        }
        {children}
      </Col>
    </Row>
  )
}

LayoutColumn.propTypes = {
  className: PropTypes.string,
  layout: PropTypes.string,
  label: PropTypes.string,
  labelLink: PropTypes.string
}
