import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { ItemsList } from 'client/components/items_list'
import { LayoutColumn } from 'client/components/layout/column'

export class Projects extends Component {
  static propTypes = {
    items: PropTypes.array
  }

  render () {
    const { items } = this.props

    return (
      <LayoutColumn label='Projects'>
        <ItemsList
          model='projects'
          list={items || []}
        />
      </LayoutColumn>
    )
  }
}
