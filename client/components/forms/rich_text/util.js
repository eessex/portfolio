import Immutable from 'immutable'
import React from 'react'
import Draft, { CompositeDecorator } from 'draft-js'

export const findLinkEntities = (contentBlock, callback, contentState) => {
  contentBlock.findEntityRanges(
    (character) => {
      const entityKey = character.getEntity()
      return (
        entityKey !== null &&
        contentState.getEntity(entityKey).getType() === 'LINK'
      )
    },
    callback
  )
}

export const Link = (props) => {
  const { children, contentState, entityKey } = props
  const { url, className } = contentState.getEntity(entityKey).getData()
  return (
    <a href={url}>
      {children}
    </a>
  )
}

export const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link,
  }
])
