import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import EventDate from '../show/components/date.jsx'
import EventVenue from '../show/components/venue.jsx'
import { ImageShow } from '../../../components/images/image/image_show.jsx'

export const EventShow = (props) => {
  const { description, images, title, venue } = props.event
  const image = images && images[0]
  
  return (
    <Row className='event--show'>
      {image &&
        <Col sm={12} lg={6}>
          <ImageShow
            url={image.url}
            caption={image.caption}
            title={image.title}
          />
        </Col>
      }
      <Col sm={12} lg={6} className='event__body container'>
        <div className='event__header'>
          <h1>{title}</h1>
          <EventDate event={props.event} />
          <EventVenue venue={venue} />
        </div>

        <div
          className='event__description'
          dangerouslySetInnerHTML={{__html: description}} />
        {renderLinks(props.event)}
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
