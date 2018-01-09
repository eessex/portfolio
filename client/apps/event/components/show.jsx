import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Item } from '../../../components/item/index.jsx'

export const EventShow = (props) => {
  const layoutProps = {
    item: props.event,
    label: 'Event',
    labelLink: true,
    model: 'events'
  }

  return (
    <Item
      {...layoutProps}
      labelLink
    />
  )
}
