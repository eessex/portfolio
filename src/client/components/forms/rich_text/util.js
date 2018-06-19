import PropTypes from 'prop-types'
import React from 'react'
import { CompositeDecorator } from 'draft-js'

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

export const Link = props => {
  const { children, contentState, entityKey } = props
  const { url } = contentState.getEntity(entityKey).getData()
  return (
    <a href={url}>
      {children}
    </a>
  )
}

Link.propTypes = {
  children: PropTypes.any,
  contentState: PropTypes.any,
  entityKey: PropTypes.string
}

export const decorator = new CompositeDecorator([
  {
    strategy: findLinkEntities,
    component: Link
  }
])
