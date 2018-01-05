import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { EmbedList } from '../../../components/embeds/embed_list.jsx'
import { ImageShow } from '../../../components/images/image/image_show.jsx'
import { LayoutGrid } from '../../../components/layout/grid.jsx'
import { PublicationHeader } from './header.jsx'

export class PublicationShow extends Component {
  showFooter = () => {
    const { publication } = this.props
    return renderLinks(publication)
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
      <PublicationHeader publication={publication} />
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

  showMedia = () => {
    const embed_codes = this.props.publication.embed_codes || []

    return <EmbedList embed_codes={embed_codes} />
  }

  render () {
    const { publication, label } = this.props
    const { compilation, title, images, description, embed_codes } = publication
    const formattedLabel = compilation ? `${label.slice(0,-1)} : Compilation` : label.slice(0,-1)

    return (
      <LayoutGrid
        body={this.showBody}
        className='PublicationShow'
        coverImage={images && images[0] && this.showCoverImage}
        footer={this.showFooter}
        header={this.showHeader}
        label={formattedLabel}
        labelLink={`/${label.toLowerCase()}`}
        media={embed_codes && this.showMedia}
      />
    )
  }
}

PublicationShow.propTypes = {
  label: PropTypes.string,
  publication: PropTypes.object
}

const renderLinks = (item) => {
  const { links } = item

  if (links && links.length) {
    return (
      <div className='LinksList'>
        {links.map( (link, i) =>
          <div className='LinksList__item' key={i}>
            <a href={link.url} target='_blank'>
              {link.title ? link.title : link.url}
            </a>
          </div>
        )}
      </div>
    )
  }
}
