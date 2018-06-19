import { clone } from 'lodash'
import PropTypes from 'prop-types'
import React from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { Description } from './components/description.jsx'
import { ItemHeader } from './components/header.jsx'
import { Label } from './components/label.jsx'
import { EmbedList } from '../embeds/embed_list.jsx'
import { LinksList } from '../links/links_list.jsx'

export const LayoutColumn = (props) => {
  const {
    children,
    item,
    label,
    labelLink,
    model,
    onChange,
    setEditing
  } = props

  let coverImage
  let embed_codes
  let images
  let links

  if (item) {
    embed_codes = item.embed_codes || []
    links = item.links || []
    images = clone(item.images) || []
    coverImage = images.length && images.splice(0, 1)
  }

  return (
    <ColumnContainer>
      <LabelContainer xs={12} sm={2}>
        <Label
          label={label}
          labelLink={labelLink}
          model={model}
        />
      </LabelContainer>

      <ContentContainer xs={12} sm={6}>
        {item &&
          <div>
            <ItemHeader
              coverImage={coverImage ? coverImage[0] : undefined}
              item={item}
              labelLink={labelLink}
              model={model}
              onChange={onChange}
              setEditing={setEditing}
            />

            <Description
              description={item.description}
              onChange={onChange && onChange}
            />

            {links &&
              <LinksList links={links} />
            }

            {embed_codes &&
              <EmbedList embed_codes={embed_codes} />
            }
          </div>
        }
        {children}
      </ContentContainer>
    </ColumnContainer>
  )
}

const ColumnContainer = Row.extend`
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

LayoutColumn.propTypes = {
  children: PropTypes.any,
  item: PropTypes.object,
  label: PropTypes.string,
  labelLink: PropTypes.any,
  model: PropTypes.string,
  onChange: PropTypes.func,
  setEditing: PropTypes.func
}
