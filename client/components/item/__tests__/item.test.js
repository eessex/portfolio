import { mount } from 'enzyme'
import React from 'react'
import { Item } from '../index'
import { LayoutColumn } from '../../layout/column.jsx'
import { LayoutGrid } from '../../layout/grid.jsx'

describe('Item', () => {
  const getWrapper = props => {
    return mount(
      <Item {...props} />
    )
  }

  let props
  beforeEach(() => {
    props = {
      editing: false,
      model: 'events',
      item: {}
    }
  })

  it('Renders LayoutColumn by default', () => {
    const component = getWrapper(props)

    expect(component.find(LayoutColumn).exists()).toBe(true)
  })

  it('Renders LayoutColumn if item is publications and no images', () => {
    props.model = 'publications'
    const component = getWrapper(props)

    expect(component.find(LayoutColumn).exists()).toBe(true)
  })

  it('Renders LayoutGrid if item is publications and has images', () => {
    props.item = {
      images: [{
        aspect: 1.2
      }]
    }
    props.model = 'publications'
    const component = getWrapper(props)

    expect(component.find(LayoutGrid).exists()).toBe(true)
  })

  it('Renders LayoutGrid if item has vertical image', () => {
    props.item = {
      images: [{
        aspect: 0.9
      }]
    }
    const component = getWrapper(props)

    expect(component.find(LayoutGrid).exists()).toBe(true)
  })

  xit('Renders ItemEdit if props.editing', () => {
    props.editing = true
    const component = getWrapper(props)
    console.log(component.html())
  })
})
