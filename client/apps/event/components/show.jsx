import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Body } from '../../../components/layout/components/body.jsx'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { LayoutGrid } from '../../../components/layout/grid.jsx'
import { ItemHeader } from '../../../components/layout/components/header.jsx'
import { LinksList } from '../../../components/links/links_list.jsx'
import { getDate, imageIsVertical } from '../../../utils/index.js'

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
    <ItemHeader
      coverImage={coverImage}
      item={event}
      model={'events'}
    />
  )
}

function renderBody(description, links) {
  return (
    <div className='Event__body'>
      <Body body={description} />
      <LinksList links={links || []} />
    </div>
  )
}

function renderMedia(embed_codes) {
  return (
    <EmbedList embed_codes={embed_codes} />
  )
}
