import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { LayoutColumn } from './column.jsx'
import { ImageShow } from '../image/image_show.jsx'
import { EmbedList } from '../embeds/embed_list.jsx'

export const LayoutGrid = (props) => {
  const {
    body,
    className,
    children,
    coverImage,
    footer,
    header,
    label,
    labelLink,
    layout,
    media
  } = props

  if (coverImage) {
    return (
      <Row
        className={`LayoutGrid ${className || ''}`}
        data-layout={layout || ''}
      >
        {(coverImage || media) &&
          <Col
            className='LayoutGrid__media'
            xs={12}
            sm={5}
          >
            {coverImage && (typeof coverImage === 'object')
              ? <ImageShow {...coverImage} />
              : coverImage()
            }
            {media
              ? (typeof media !== 'function') &&
                  <EmbedList embed_codes={media} />

              : media()
            }
          </Col>
        }
        <Col
          className='LayoutGrid__item'
          smOffset={coverImage ? 0 : 2}
          xs={12}
          sm={6}
        >
          {(label || header) &&
            <div className='LayoutGrid__header'>
              {label && renderLabel(label, labelLink)}
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
        </Col>
      </Row>
    )
  } else {
    return (
      <LayoutColumn {...props} />
    )
  }
}

const renderLabel = (label, link=null) => {
  return (
    <div className='LayoutGrid__label'>
      {link
        ? <a href={link}>{label}</a>
        : label
      }
    </div>
  )
}

LayoutGrid.propTypes = {
  body: PropTypes.func,
  className: PropTypes.string,
  header: PropTypes.func,
  footer: PropTypes.func,
  layout: PropTypes.string,
  label: PropTypes.string,
  labelLink: PropTypes.string,
  media: PropTypes.any
}
