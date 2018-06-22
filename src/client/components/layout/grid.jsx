import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Description } from './components/description'
import { ItemHeader } from './components/header'
import { EmbedList } from 'client/components/embeds/embed_list'
import { ImagesShow } from 'client/components/images/images_show'
import { LinksList } from 'client/components/links/links_list'
import { ContentContainer } from './column'

export const LayoutGrid = (props) => {
  const {
    item,
    label,
    labelLink,
    model,
    onChange,
    setEditing
  } = props

  const {
    description,
    embed_codes
  } = item

  const images = item.images || []
  const gridCoverImage = images.length > 0 ? images[0] : undefined

  return (
    <GridContainer>
      <MediaContainer xs={12} sm={gridCoverImage ? 5 : 2}>
        {gridCoverImage &&
          <ImagesShow images={images} />
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

LayoutGrid.propTypes = {
  item: PropTypes.object,
  label: PropTypes.string,
  labelLink: PropTypes.any,
  model: PropTypes.string,
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}