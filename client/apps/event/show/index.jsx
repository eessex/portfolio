import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { ImageShow } from '../../components/images/image/image_show.jsx'
import { Venue } from '../../components/venue/index.jsx'
import { getDate } from '../../../utils/index.js'

export const EventShow = (props) => {
  const { event } = props
  const { description, images, title, venue } = event
  const image = images && images[0]
  const date = getDate('events', event)

  return (
    <Row className='EventShow'>
      {image &&
        <Col sm={12} lg={6}>
          <ImageShow
            url={image.url}
            caption={image.caption}
            title={image.title}
          />
        </Col>
      }
      <Col sm={12} lg={6} className='Event__body'>
        <div className='Event__header'>
          <h1>{title}</h1>
          <h4>{date}</h4>
          <Venue venue={venue || {}} className='h4' />
        </div>

        {description &&
          <div
            className='Event__description'
            dangerouslySetInnerHTML={{__html: description}}
          />
        }

        {renderLinks(event)}
      </Col>
    </Row>
  )
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
