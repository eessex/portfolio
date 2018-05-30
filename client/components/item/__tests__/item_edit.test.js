import { mount } from 'enzyme'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import React from 'react'
import { EditNav } from '../../forms/edit_nav.jsx'
import { ItemEdit } from '../item_edit.jsx'
import { ItemEditModals } from '../item_edit_modals.jsx'
import { LayoutColumn } from '../../layout/column.jsx'
import { LayoutGrid } from '../../layout/grid.jsx'

describe('ItemEdit', () => {
  const getWrapper = props => {
    const mockStore = configureStore([])
    const store = mockStore({
      item: props.item
    })

    return mount(
      <Provider store={store}>
        <ItemEdit {...props} />
      </Provider>
    )
  }

  let props
  beforeEach(() => {
    props = {
      isEditing: null,
      setEditing: jest.fn(),
      changeItem: jest.fn(),
      item: {
        item: {},
        isSaved: true,
        isSaving: false
      },
      maybeSaveItem: jest.fn(),
      model: 'events'
    }
  })

  it('Renders EditNav', () => {
    const component = getWrapper(props)
    expect(component.find(EditNav).exists()).toBe(true)
  })

  it('Renders ItemEditModals', () => {
    const component = getWrapper(props)
    expect(component.find(ItemEditModals).exists()).toBe(true)
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
    props.item.item = {
      images: [{
        aspect: 1.2
      }]
    }
    props.model = 'publications'
    const component = getWrapper(props)
    expect(component.find(LayoutGrid).exists()).toBe(true)
  })

  it('Renders LayoutGrid if item has vertical image', () => {
    props.item.item = {
      images: [{
        aspect: 0.9
      }]
    }
    const component = getWrapper(props)
    expect(component.find(LayoutGrid).exists()).toBe(true)
  })

  it('#setEditing sets state.isEditing to arg', () => {
    const component = getWrapper(props)
    component.childAt(0).instance().setEditing('images')
    expect(component.childAt(0).instance().state.isEditing).toBe('images')
  })

  it('#onChange calls props.changeItem and props.maybeSaveItem', () => {
    const component = getWrapper(props)
    component.childAt(0).instance().onChange('title', 'New Title')
    expect(props.changeItem.mock.calls[0][0]).toBe('title')
    expect(props.changeItem.mock.calls[0][1]).toBe('New Title')
    expect(props.maybeSaveItem.mock.calls[0][0]).toBe(props.model)
  })
})
