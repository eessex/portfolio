import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Description } from './components/description.jsx'
import { ItemHeader } from './components/header.jsx'
import { Label } from './components/label.jsx'
import { EmbedList } from '../embeds/embed_list.jsx'
import { ImageShow } from '../image/image_show.jsx'
import { LinksList } from '../links/links_list.jsx'

export const LayoutColumn = (props) => {
  const {
    children,
    className,
    item,
    label,
    labelLink,
    layout,
    model,
    onChange,
    setEditing
  } = props

  let coverImage
  let embed_codes
  let images
  let links

  if (item) {
    embed_codes = item.embed_codes || []
    links = item.links || []
    images = item.images || []
    coverImage = images.length && images.splice(0, 1)
  }

  return (
    <Row
      className={`LayoutColumn ${className || ''}`}
      data-layout={layout || ''}
    >
      <Col
        className='LayoutColumn__label'
        xs={12}
        sm={2}
      >
        <Label
          label={label}
          labelLink={labelLink}
          model={model}
        />
      </Col>

      <Col
        className='LayoutColumn__item'
        xs={12}
        sm={6}
      > 
        {item &&
          <div>
            <ItemHeader
              coverImage={coverImage ? coverImage[0] : undefined}
              item={item}
              labelLink={labelLink}
              model={model}
              onChange={onChange}
              setEditing={setEditing}
            />

            <Description
              description={item.description}
              onChange={onChange ? onChange : undefined}
            />

            {links &&
              <LinksList links={links}/>
            }

            {embed_codes &&
              <EmbedList
                embed_codes={embed_codes}
              />
            }
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
  labelLink: PropTypes.bool
}
