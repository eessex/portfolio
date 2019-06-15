import React from 'react'
import styled from 'styled-components'
import { Col, Row } from 'react-styled-flexboxgrid'
import { LinksList } from 'client/components/links/links_list'
import { Social } from 'client/components/social/social_list'
import { SocialContainer } from '../grid'
import { Description } from './description'
import { ImageGrid } from 'client/components/images/image_grid/image_grid'
import { Item, Image, Model, Social as SocialType} from 'client/typings'

interface ItemBodyProps {
  displayImages?: Image[]
  item: Item
  images: Image[]
  model: Model
  onChange: (key: string, val: any) => void
  setEditing: (isEditing: string | null) => void
  social: SocialType[]
}

export const ItemBody: React.SFC<ItemBodyProps> = props => {
  const {
    item,
    images,
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

  return (
    <ItemBodyContainer>
      {isPage &&
        <Description
          description={item.lead_text}
          onChange={onChange && onChange}
          fieldName='lead_text'
          placeholder='Primary text (additional images display below)'
        />
      }
      {hasSecondaryImages &&
        <ImageGrid
          images={images}
          onClick={setEditing ? () => setEditing('images') : undefined}
          hasCover
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

export const ColumnContainer = styled(Row)`
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

export const LabelContainer = styled(Col)`
  margin-bottom: 1em;
  padding: 0;
`

export const ContentContainer = styled(Col)`
  margin: 0 auto 0 0;
  padding: 0;
`
