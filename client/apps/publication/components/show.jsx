import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { ImageShow } from '../../../components/image/image_show.jsx'
import { ItemHeader } from '../../../components/layout/components/header.jsx'
import { LayoutGrid } from '../../../components/layout/grid.jsx'
import { LinksList } from '../../../components/links/links_list.jsx'

export class PublicationShow extends Component {
  showFooter = () => {
    const { links } = this.props.publication

    return <LinksList links={links || []} />
  }

  showBody = () => {
    const { description } = this.props.publication

    if (description) {
      return (
        <div
          className='Publication__description'
          dangerouslySetInnerHTML={{__html: description}}
        />
      )
    }
  }

  showHeader = () => {
    const { publication } = this.props

    return (
      <ItemHeader
        item={publication}
        model='publications'
      />
    )
  }

  showCoverImage = () => {
    const { publication } = this.props
    const images = publication.images || []

    if (images.length) {
      const image = images[0]
      return (
        <ImageShow {...image} />
      )
    }
  }

  render () {
    const { publication, label } = this.props
    const { compilation, title, description } = publication
    const formattedLabel = compilation ? `${label.slice(0,-1)} : Compilation` : label.slice(0,-1)

    const embed_codes = publication.embed_codes || []
    const images =  publication.images || []

    return (
      <LayoutGrid
        body={this.showBody}
        className='PublicationShow'
        coverImage={images.length > 0 && images[0]}
        footer={this.showFooter}
        header={this.showHeader}
        label={formattedLabel}
        labelLink={`/${label.toLowerCase()}`}
        media={embed_codes}
      />
    )
  }
}

PublicationShow.propTypes = {
  label: PropTypes.string,
  publication: PropTypes.object
}
