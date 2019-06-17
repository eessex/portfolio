import styled from 'styled-components'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { Col, Row } from 'react-styled-flexboxgrid'
import { capitalize } from 'lodash'
import { getDate, getVenue } from 'client/utils'
import { ListItem } from './components/list_item'
import { H6 } from 'client/styles/text'
import { ItemListLayout, Model } from 'client/typings'

interface ItemsListProps {
  canToggle?: boolean
  children?: any
  comingSoon?: boolean
  label: string
  layout: ItemListLayout
  list: any[]
  model: Model
}

interface ItemsListState {
  layout: ItemListLayout
}

export class ItemsList extends Component<ItemsListProps, ItemsListState> {
  state = {
    layout: this.props.layout || 'list'
  }

  renderLabel = () => {
    const { layout } = this.state
    const { canToggle, label, model } = this.props
    const hasBorder = layout === 'table' || canToggle
    const renderedLabel = label && label.length ? label : capitalize(model)

    return (
      <ItemsListHeader canToggle={hasBorder}>
        {renderedLabel}
        {canToggle && this.renderLayoutToggle()}
      </ItemsListHeader>
    )
  }

  renderLayoutToggle = () => {
    const { layout } = this.state
    const { model } = this.props

    const isTable = layout === 'table'
    const toggleTo = isTable ? 'grid' : 'table'
    const text = isTable ? (model === 'releases' ? 'Covers' : 'Posters') : 'List'
    const icon = isTable ? 'expand' : 'bars'

    return (
      <LayoutToggle onClick={() => this.setState({layout: toggleTo})}>
        {text}
        <FontAwesome name={icon} />
      </LayoutToggle>
    )
  }

  renderList = items => {
    const { layout } = this.state
    const { canToggle, label } = this.props

    switch (layout) {
      case 'grid':
        if (label && !canToggle) {
          return (
            <ListContainer layout={layout}>
              <Content xs={12} lg={2}>
                {this.renderLabel()}
              </Content>
              <Content xs={12} lg={10}>
                <ItemGridContainer>
                  {items}
                </ItemGridContainer>
              </Content>
            </ListContainer>
          )
        } else {
          return (
            <ItemGridContainer>
              {items}
            </ItemGridContainer>
          )
        }

        default:
        return (
          <ListContainer layout={layout}>
            {items}
          </ListContainer>
        )
    }
  }

  renderListItems = () => {
    const { layout } = this.state
    const { canToggle, list, model } = this.props

    return list.map((item, i) => {
      const date = getDate(model, item)
      const venue = getVenue(item.venue)

      return (
        <ListItem
          key={i}
          artist={item.artist}
          date={date}
          formats={item.formats}
          image={item.images[0]}
          layout={layout}
          slug={`/${model}/${item.published ? item.slug || item._id : item._id}`}
          title={item.title}
          venue={venue}
          published={item.published}
          condensed={canToggle}
        />
      )
    })
  }

  render () {
    const {
      canToggle,
      children,
      comingSoon,
      label,
      list
    } = this.props

    const { layout } = this.state
    const listItems = children || this.renderListItems()
    const hasLabel = label && layout !== 'grid' || layout === 'grid' && canToggle

    return (
      <ItemsListContainer
        layout={layout}
        canToggle={canToggle}
      >
        {hasLabel && this.renderLabel()}

        {list.length
          ? this.renderList(listItems)
          : comingSoon && 'Coming Soon'
        }
      </ItemsListContainer>
    )
  }
}

const ItemsListContainer = styled.div<{
  canToggle?: boolean,
  layout: ItemListLayout
}>`
  margin-bottom: 3em;
  padding-left: 0;
  padding-right: 0;

  ${({ layout }) => layout !== 'table' && `
    display: flex;
  `}

  ${props => props.canToggle && `
    display: block;
  `}

  @media (max-width: 76rem) {
    ${({ layout }) => layout !== 'table' && `
      flex-direction: column;
    `}
  }
`

const LayoutToggle = styled(H6)`
  &:hover {
    color: ${({ theme }) => theme.colors.gray};
    cursor: pointer;
  }

  .fa {
    margin-left: 10px;
  }
`

const ListContainer = styled.div<{
  layout: ItemListLayout
}>`
  display: flex;
  flex: 1;

  ${props => props.layout === 'grid' && `
    flex-wrap: wrap;
    padding: 0;
  `}

  ${props => props.layout !== 'grid' && `
    flex-direction: column;
  `}

  @media (max-width: 76rem) {
    flex-direction: column;
  }
`

const ItemsListHeader = styled.div<{
  canToggle?: boolean
}>`
  margin-top: 0;
  font-weight: 600;
  padding: 0 20px;

  @media (max-width: 76rem) {
    padding: 0 20px 10px;
  }

  ${({ canToggle }) => canToggle && `
    border-bottom: 1px solid;
    padding: 0 20px 5px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `}
`

const ItemGridContainer = styled(Row)`
  margin: 0;
  padding: 0 10px;

  @media (max-width: 76rem) {
    padding: 0;
  }
`

const Content = styled(Col)`
  padding: 0;

  ${ItemGridContainer} {
    padding: 0 20px;
    justify-content: space-evenly;
  }
`
