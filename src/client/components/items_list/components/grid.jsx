import styled from 'styled-components'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Col, Row } from 'react-styled-flexboxgrid'
import { ItemGrid } from "./item_grid"
import { ItemsListToggleHeader } from "./toggle_header"

export class ItemListGrid extends Component {
  renderListItems = () => {
    const { condensed, list, model } = this.props

    return list.map((item, i) => {
      return (
        <ItemGrid
          key={i}
          item={item}
          model={model}
          condensed={condensed}
        />
      )
    })
  }

  render() {  
    const { label, model } = this.props

    if (label) {
      return (
        <ListContainer>
          <Content xs={12} lg={2}>
            <ItemsListToggleHeader label={label} model={model} />
          </Content>

          <Content xs={12} lg={10}>
            <ItemGridContainer>
              {this.renderListItems()}
            </ItemGridContainer>
          </Content>
        </ListContainer>
      )
    } else {
      return (
        <ItemGridContainer>
          {this.renderListItems()}
        </ItemGridContainer>
      )
    }
  }
}

const ListContainer = styled.div`
  display: flex;
  flex: 1;
  flex-wrap: wrap;
  padding: 0;

  @media (max-width: 46rem) {
    flex-direction: column;
  }
`

const ItemGridContainer = Row.extend`
  margin: 0;
  padding: 0 10px;
  justify-content: space-evenly;
  padding: 0 20px;

  @media (max-width: 76rem) {
    justify-content: space-between;
  }

`

const Content = Col.extend`
  padding: 0;
`

// ItemsList.propTypes = {
//   canToggle: PropTypes.bool,
//   children: PropTypes.any,
//   comingSoon: PropTypes.bool,
//   label: PropTypes.string,
//   layout: PropTypes.string,
//   list: PropTypes.array.isRequired,
//   model: PropTypes.string.isRequired
// }
