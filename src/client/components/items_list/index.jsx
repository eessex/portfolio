import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { Col, Row } from 'react-styled-flexboxgrid'
import { capitalize } from 'lodash'
import { getDate, getVenue } from 'client/utils'
import { ListItem } from './components/list_item'
import { H6 } from 'client/styles/text'

export class ItemsList extends Component {
  state = {
    layout: this.props.layout || 'list'
  }

  renderLabel = () => {
    const { layout } = this.state
    const { canToggle, label, model } = this.props
    const hasBorder = layout === 'table' || canToggle
    const renderedLabel = label && label.length ? label : capitalize(model)

    return (
      <ItemsListHeader layout={layout} canToggle={hasBorder}>
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
            <ListContainer canToggle={canToggle} layout={layout}>
              <Content xs={12} lg={2}>
                {this.renderLabel()}
              </Content>
              <Content xs={12} lg={10}>
                <ItemGridContainer canToggle={canToggle} layout={layout}>
                  {items}
                </ItemGridContainer>
              </Content>
            </ListContainer>
          )
        } else {
          return (
            <ItemGridContainer canToggle={canToggle} layout={layout}>
              {items}
            </ItemGridContainer>
          )
        }
      default:
        return (
          <ListContainer canToggle={canToggle} layout={layout}>
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
          publisher={item.publisher}
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

const ItemsListContainer = styled.div`
  margin-bottom: 3em;
  padding-left: 0;
  padding-right: 0;
  ${props => props.layout !== 'table' && `
    display: flex;
  `}
  ${props => props.canToggle && `
    display: block;
  `}
  @media (max-width: 76rem) {
    ${props => props.layout !== 'table' && `
      flex-direction: column;
    `}
  }
`

const LayoutToggle = H6.extend`
  &:hover {
    color: #ddd;
    cursor: pointer;
  }
  .fa {
    margin-left: 10px;
  }
`

const ListContainer = styled.div`
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

const ItemsListHeader = styled.div`
  margin-top: 0;
  font-weight: 500;
  padding: 0 20px;

  @media (max-width: 76rem) {
    padding: 0 20px 10px;
  }
  ${props => props.canToggle && `
    border-bottom: 1px solid;
    padding: 0 20px 5px 20px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  `}
`

const ItemGridContainer = Row.extend`
  margin: 0;
  padding: 0 10px;
  @media (max-width: 76rem) {
    padding: 0;
  }
`

const Content = Col.extend`
  padding: 0;
  ${ItemGridContainer} {
    padding: 0 20px;
    justify-content: space-evenly;
  }
`

ItemsList.propTypes = {
  canToggle: PropTypes.bool,
  children: PropTypes.any,
  comingSoon: PropTypes.bool,
  label: PropTypes.string,
  layout: PropTypes.string,
  list: PropTypes.array.isRequired,
  model: PropTypes.string.isRequired
}
