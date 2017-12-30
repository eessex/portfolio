import PropTypes from 'prop-types'
import React from 'react'
import { PublicationHeader } from './header.jsx'
import { LayoutColumn } from '../../../components/layout/column.jsx'
import { Embed } from '../../../components/embeds/embed_list.jsx'

export const PublicationShow = (props) => {
  const { publication, label } = props || {}
  const { title, images, description, embed_url } = publication

  return (
    <LayoutColumn
      className='PublicationShow'
      label={label}
      labelLink={`/${label}`}
    >
      <PublicationHeader
        publication={publication}
        coverImage={images && images[0]}
      />
      {description &&
        <div
          className='PublicationShow__body'
          dangerouslySetInnerHTML={{__html: description}}
        />
      }
      {embed_url &&
        <Embed item={embed_url} />
      }
      {renderLinks(publication)}
    </LayoutColumn>
  )
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
