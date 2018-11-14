import { mount } from 'enzyme'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { ItemAdminNav } from 'client/components/Nav/Components/ItemAdminNav'
import { LayoutColumn } from 'client/components/layout/column'
import { LayoutGrid } from 'client/components/layout/grid'
import { ItemEdit } from '../item_edit'
import { ItemEditModals } from '../item_edit_modals'

describe('ItemEdit', () => {
  const getWrapper = props => {
    const mockStore = configureStore([])
    const store = mockStore({
      itemReducer: { item: props.item }
    })

    return mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ItemEdit {...props} />
        </ThemeProvider>
      </Provider>
    )
  }

  let props
  beforeEach(() => {
    props = {
      isEditing: null,
      setEditing: jest.fn(),
      changeItemAction: jest.fn(),
      item: {},
      isSaved: true,
      isSaving: false,
      maybeSaveItem: jest.fn(),
      model: 'events'
    }
  })

  it('Renders ItemAdminNav', () => {
    const component = getWrapper(props)
    expect(component.find(ItemAdminNav).exists()).toBe(true)
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

  it('#setEditing sets state.isEditing to arg', () => {
    const component = getWrapper(props)
    component.find(ItemEdit).instance().setEditing('images')
    expect(component.find(ItemEdit).instance().state.isEditing).toBe('images')
  })

  it('#onChange calls props.changeItem and props.maybeSaveItem', () => {
    const component = getWrapper(props)
    component.find(ItemEdit).instance().onChange('title', 'New Title')
    expect(props.changeItemAction.mock.calls[0][0]).toBe('title')
    expect(props.changeItemAction.mock.calls[0][1]).toBe('New Title')
    expect(props.maybeSaveItem.mock.calls[0][0]).toBe(props.model)
  })
})
