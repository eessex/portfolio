import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import styled from 'styled-components'
import { Col, Row } from 'react-styled-flexboxgrid'
import { LinksList } from 'client/components/links/links_list'
import { Social } from 'client/components/social/social_list'
import { SocialContainer } from '../grid'
import { Description } from './description'
import { ImagesShow } from 'client/components/images/images_show'

export const ItemBody = props => {
  const {
    item,
    images,
    displayImages,
    model,
    onChange,
    setEditing,
    social
  } = props

  let links

  if (item) {
    links = item.links || []
  }
  const isPage = model === 'pages'
  const hasSecondaryImages = images && images.length !== 0

  const descriptionPlaceholder = isPage && hasSecondaryImages
    ? 'Primary text (additional images display below)'
    : 'Primary text (displays above images)'

  return (
    <ItemBodyContainer>
      {isPage &&
        <Description
          description={item.lead_text}
          onChange={onChange && onChange}
          fieldName='lead_text'
          placeholder={descriptionPlaceholder}
        />
      }
      {hasSecondaryImages &&
        <ImagesShow
          images={images}
          displayImages={displayImages}
          isGrid
          onClick={setEditing ? () => setEditing('images') : undefined}
        />
      }
      <Description
        description={item.description}
        onChange={onChange && onChange}
      />
      {links && links.length > 0 &&
        <LinksList links={links} />
      }
      {social &&
        <SocialContainer>
          <Social social={social} />
        </SocialContainer>
      }
    </ItemBodyContainer>
  )
}

const ItemBodyContainer = styled.div`
  padding-bottom: 2em;
`

export const ColumnContainer = Row.extend`
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

export const LabelContainer = Col.extend`
  margin-bottom: 1em;
  padding: 0;
`

export const ContentContainer = Col.extend`
  margin: 0 auto 0 0;
  padding: 0;
`

ItemBody.propTypes = {
  item: PropTypes.object,
  images: PropTypes.array,
  model: PropTypes.string,
  onChange: PropTypes.func,
  setEditing: PropTypes.func,
  social: PropTypes.array
}
