import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Item } from '../../../components/item/index.jsx'

export class PublicationShow extends Component {
  render () {
    const { publication, label } = this.props
    const { compilation, title, description } = publication
    const formattedLabel = compilation ? `${label.slice(0,-1)} : Compilation` : label.slice(0,-1)

    const embed_codes = publication.embed_codes || []
    const images =  publication.images || []

    return (
      <Item
        item={publication}
        label={formattedLabel}
        model='publications'
      />
    )
  }
}

PublicationShow.propTypes = {
  label: PropTypes.string,
  publication: PropTypes.object
}
