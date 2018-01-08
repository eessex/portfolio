import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { imageIsVertical } from '../../utils/index.js'
import { ItemHeader } from './components/header.jsx'
import { LayoutColumn } from './column.jsx'
import { ImageShow } from '../image/image_show.jsx'
import { EmbedList } from '../embeds/embed_list.jsx'

export const LayoutGrid = (props) => {
  const {
    body,
    className,
    footer,
    header,
    item,
    label,
    labelLink,
    layout,
    media,
    model,
    setEditing
  } = props

  const images = item.images || []
  const isGrid = images.length > 0 && imageIsVertical(images[0])
  const gridCoverImage = isGrid && images.length > 0 ? images[0] : undefined

  return (
    <Row
      className={`LayoutGrid ${className || ''}`}
      data-layout={layout || ''}
    >
      <Col
        className='LayoutGrid__media'
        xs={12}
        sm={isGrid ? 5 : 2}
      >
        {!isGrid &&
          <label>{renderLabel(label, labelLink)}</label>
        }
        {
          <ImageShow {...gridCoverImage} />
        }
        {media && (typeof media !== 'function') &&
          <EmbedList embed_codes={media} />
        }
      </Col>

      <Col
        className='LayoutGrid__item'
        xs={12}
        sm={6}
      >

        {item && model &&
          <ItemHeader
            item={item}
            label={label}
            model={model}
            setEditing={setEditing}
          />
        }

      </Col>
    </Row>
  )
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
