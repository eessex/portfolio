import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { ImageShow } from '../../../components/images/image/image_show.jsx'
import { Venue } from '../../../components/venue/index.jsx'
import { getDate } from '../../../utils/index.js'
import { LayoutColumn } from '../../../components/layout/column.jsx'

export const EventShow = (props) => {
  const { event } = props
  const { description, images, title, venue } = event
  const image = images && images[0]

  if (image && image.aspect && image.aspect < .9) {
    return (
      <Row className='EventShow Row'>
        <Col sm={12} lg={5}>
        {renderCoverImage(image)}
        </Col>

        <Col sm={12} lg={7}>
          {renderHeader(event)}
        </Col>
      </Row>
    )
  } else {
    return (
      <LayoutColumn className='EventShow'>
        {renderCoverImage(image || {})}
        {renderHeader(event)}
        <div className='Event__body'>
          {renderDescription(description)}
          {renderLinks(event)}
        </div>
      </LayoutColumn>
    )
  }
}

function renderCoverImage(image) {
  const { aspect, caption, title, url } = image
  if (url) {
    return (
      <ImageShow
        url={url}
        caption={caption}
        title={title}
      />
    )
  }
}

function renderHeader(event) {
  const { title, venue } = event
  const date = getDate('events', event)

  if (title || venue || date) {
    return (
      <div className='Event__header'>
        <h1>{title}</h1>
        <h4>{date}</h4>
        <Venue venue={venue || {}} className='h4' />
      </div>
    )
  }
}

function renderDescription(description) {
  if (description) {
    return (
      <div
        className='Event__description'
        dangerouslySetInnerHTML={{__html: description}}
      />
    )
  }
}

function renderLinks(event) {
  if (event.links) {
    const listItems =  event.links.map( (link, i) =>
      <div className='event--show__link' key={i}>
        <a href={link.url} target='_blank'>
          {link.title ? link.title : link.url}
        </a>
      </div>
    )
  return <div className='event--show__links'>{listItems}</div>
  }
}
