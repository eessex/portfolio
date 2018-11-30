import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Description } from './components/description'
import { ItemHeader } from './components/header'
import { EmbedList } from 'client/components/embeds/embed_list'
import { Image } from 'client/components/image/image'
import { ImageGrid } from 'client/components/images/image_grid/image_grid'
import { LinksList } from 'client/components/links/links_list'
import { Social } from 'client/components/social/social_list'
import { ContentContainer } from './column'

export const LayoutGrid = props => {
  const {
    item,
    label,
    labelLink,
    model,
    onChange,
    setEditing,
    social
  } = props

  const {
    description,
    embed_codes
  } = item
  const hasImages = item.images && item.images.length > 0
  const images = item.images || []
  const gridCoverImage = hasImages ? images[0] : undefined

  return (
    <GridContainer>
      <MediaContainer xs={12} sm={gridCoverImage ? 5 : 2}>
        {gridCoverImage &&
          <Image {...gridCoverImage} />
        }
        {images.length > 1 &&
          <ImageGrid
            hasCover
            isGrid
            images={images}
          />
        }
        {embed_codes &&
          <EmbedList embed_codes={embed_codes} />
        }
      </MediaContainer>

      <ContentContainer xs={12} sm={6}>
        <ItemHeader
          item={item}
          label={label}
          labelLink={labelLink}
          model={model}
          setEditing={setEditing}
          onChange={onChange}
        />

        <Description
          description={description}
          onChange={onChange}
        />

        {social &&
          <SocialContainer>
            <Social social={social} />
          </SocialContainer>
        }
        <LinksList links={item.links || []} />

      </ContentContainer>
    </GridContainer>
  )
}

const GridContainer = Row.extend`
  padding: 0 20px;
  margin-left: 0;
  margin-right: 0;
  margin-bottom: 4em;

  .Image {
    margin-bottom: 1em;
  }

  .LinksList {
    margin-top: calc(2em - 10px);
    margin-bottom: 2em;
  }
`

const MediaContainer = Col.extend`
  margin-right: 30px;
  max-width: 450px !important;
  padding-bottom: 30px;

  @media (max-width: 46rem) {
    max-width: 100% !important;
  }
`

export const SocialContainer = styled.div`
  font-size: 90%;
  padding: 1em 0 4em;
`

LayoutGrid.propTypes = {
  item: PropTypes.object,
  label: PropTypes.string,
  labelLink: PropTypes.any,
  model: PropTypes.string,
  onChange: PropTypes.func,
  setEditing: PropTypes.func,
  social: PropTypes.object
}
