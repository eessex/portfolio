import React from 'react'

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
