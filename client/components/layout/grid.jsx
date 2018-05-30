import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Description } from './components/description.jsx'
import { ItemHeader } from './components/header.jsx'
import { EmbedList } from '../embeds/embed_list.jsx'
import { ImagesShow } from '../images/images_show.jsx'
import { LinksList } from '../links/links_list.jsx'

export const LayoutGrid = (props) => {
  const {
    className,
    item,
    label,
    labelLink,
    layout,
    model,
    onChange,
    setEditing
  } = props

  const {
    description,
    embed_codes
  } = item

  const images = item.images || []
  const gridCoverImage = images.length > 0 ? images[0] : undefined

  return (
    <Row
      className={`LayoutGrid ${className || ''}`}
      data-layout={layout || ''}
    >
      <Col
        className='LayoutGrid__media'
        xs={12}
        sm={gridCoverImage ? 5 : 2}
      >
        {gridCoverImage &&
          <ImagesShow images={images} />
        }
        {embed_codes &&
          <EmbedList embed_codes={embed_codes} />
        }
      </Col>

      <Col
        className='LayoutGrid__item'
        xs={12}
        sm={6}
      >
        <ItemHeader
          item={item}
          label={label}
          labelLink={labelLink}
          model={model}
          setEditing={setEditing}
          onChange={onChange}
        />

        <Description
          description={description}
          onChange={onChange}
        />

        <LinksList links={item.links || []} />

      </Col>
    </Row>
  )
}

LayoutGrid.propTypes = {
  className: PropTypes.string,
  item: PropTypes.object,
  layout: PropTypes.string,
  label: PropTypes.string,
  labelLink: PropTypes.any,
  model: PropTypes.string,
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}
