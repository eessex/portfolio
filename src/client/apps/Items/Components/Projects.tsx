import React, { Component } from 'react'
import { ItemsList } from 'client/components/items_list'
import { LayoutColumn } from 'client/components/layout/column'
import { Item } from 'client/typings'

interface ProjectsProps {
  items: Item[]
}

export class Projects extends Component<ProjectsProps> {
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
