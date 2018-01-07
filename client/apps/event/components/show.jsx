import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Body } from '../../../components/layout/components/body.jsx'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { LayoutGrid } from '../../../components/layout/grid.jsx'
import { getDate, imageIsVertical } from '../../../utils/index.js'
import { EventHeader } from './header.jsx'

export const EventShow = (props) => {
  const { event } = props

  const {
    description,
    links,
    title,
    venue
  } = event

  const embed_codes = event.embed_codes || []
  const images = event.images || []
  const isGrid = images.length > 0 && imageIsVertical(images[0])

  const layoutProps = {
    body: () => renderBody(description, links),
    coverImage: isGrid && images[0],
    header: () => renderHeader(event, isGrid),
    label: 'Event',
    labelLink: '/events',
    media: () => renderMedia(embed_codes)
  }

  return (
    <div className='EventShow'>
      {isGrid
        ? <LayoutGrid {...layoutProps} />
        : <LayoutColumn {...layoutProps} />
      }
    </div>
  )
}

function renderHeader(event, isGrid) {
  const images = event.images || []
  const coverImage = !isGrid && images.length > 0 ? images[0] : undefined

  return (
    <EventHeader
      coverImage={coverImage}
      event={event}
    />
  )
}

function renderBody(description, links) {
  return (
    <div className='Event__body'>
      <Body body={description} />
      {renderLinks(links)}
    </div>
  )
}

function renderMedia(embed_codes) {
  return (
    <EmbedList embed_codes={embed_codes} />
  )
}

function renderLinks(links) {
  if (links) {
    const listItems =  links.map( (link, i) =>
      <div className='event--show__link' key={i}>
        <a href={link.url} target='_blank'>
          {link.title ? link.title : link.url}
        </a>
      </div>
    )
  return <div className='event--show__links'>{listItems}</div>
  }
}
