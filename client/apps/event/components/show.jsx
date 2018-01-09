import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { LayoutGrid } from '../../../components/layout/grid.jsx'
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

  const layoutProps = {
    item: event,
    label: 'Event',
    model: 'events'
  }

  return (
    <div className='EventShow'>
      <LayoutGrid {...layoutProps} />
    </div>
  )
}

function renderMedia(embed_codes) {
  return (
    <EmbedList embed_codes={embed_codes} />
  )
}
