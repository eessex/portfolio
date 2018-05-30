import { mount } from 'enzyme'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import React from 'react'
import { Item } from '../index'
import { ItemEdit } from '../item_edit'
import { LayoutColumn } from '../../layout/column'
import { LayoutGrid } from '../../layout/grid'

describe('Item', () => {
  const getWrapper = props => {
    return mount(
      <Item {...props} />
    )
  }

  const getConnectedWrapper = props => {
    const mockStore = configureStore([])
    const store = mockStore({
      item: {
        item: props.item,
        isSaved: true,
        isSaving: false
      }
    })

    return mount(
      <Provider store={store}>
        <Item {...props} />
      </Provider>
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

  it('Renders ItemEdit if props.editing', () => {
    props.editing = true
    const component = getConnectedWrapper(props)

    expect(component.find(ItemEdit).exists()).toBe(true)
  })
})
