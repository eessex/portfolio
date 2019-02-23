import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { ListItem, Item } from './components/list_item'
import { ItemsListToggleHeader } from "./components/toggle_header"
import { ItemListGrid } from './components/grid'

export class ItemsList extends Component {
  state = {
    layout: this.props.layout || 'list'
  }

  renderList = items => {
    const { layout } = this.state
    const { canToggle, label, list, model } = this.props

    switch (layout) {
      case 'grid':
        return (
          <ItemListGrid
            label={!canToggle && label}
            list={list}
            model={model}
            condensed={canToggle}
          />
        )
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
      return (
        <ListItem
          key={i}
          index={i}
          item={item}
          model={model}
          layout={layout}
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
      list,
      model
    } = this.props

    const { layout } = this.state
    const listItems = children || this.renderListItems()
    const hasLabel = label && layout !== 'grid' || layout === 'grid' && canToggle

    return (
      <ItemsListContainer
        layout={layout}
        canToggle={canToggle}
      >
        {hasLabel && 
          <ItemsListToggleHeader
            label={label}
            isTable={layout === 'table'}
            model={model}
            onToggle={canToggle ? (newLayout) => this.setState({layout: newLayout}) : undefined}
          />
        }

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


  ${Item} {
    ${props => props.layout === "table" && `
      border-top: 1px solid red;
    `}
  }

  ${props => props.canToggle && `
    display: block;
  `}
  @media (max-width: 76rem) {
    ${props => props.layout !== 'table' && `
      flex-direction: column;
    `}
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
  font-weight: 600;
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
