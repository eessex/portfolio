import { mount } from 'enzyme'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { LayoutColumn } from 'client/components/layout/column'
import { LayoutGrid } from 'client/components/layout/grid'
import { Item } from '../index'
import { ItemEdit } from '../item_edit'

describe('Item', () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(
      <ThemeProvider theme={theme}>
        <Item {...passedProps} />
      </ThemeProvider>
    )
  }

  const getConnectedWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      itemReducer: {
        item: passedProps.item,
        isSaved: true,
        isSaving: false
      }
    })

    return mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <Item {...passedProps} />
        </ThemeProvider>
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      editing: false,
      model: 'events',
      item: {}
    }
  })

  it('Renders LayoutColumn by default', () => {
    const component = getWrapper()

    expect(component.find(LayoutColumn).exists()).toBe(true)
  })

  it('Renders LayoutColumn if item is publications and no images', () => {
    props.model = 'publications'
    const component = getWrapper()

    expect(component.find(LayoutColumn).exists()).toBe(true)
  })

  it('Renders LayoutGrid if item is publications and has images', () => {
    props.item = {
      images: [{
        aspect: 1.2
      }]
    }
    props.model = 'publications'
    const component = getWrapper()

    expect(component.find(LayoutGrid).exists()).toBe(true)
  })

  it('Renders LayoutGrid if item has vertical image', () => {
    props.item = {
      images: [{
        aspect: 0.9
      }]
    }
    const component = getWrapper()

    expect(component.find(LayoutGrid).exists()).toBe(true)
  })

  it('Renders ItemEdit if props.editing', () => {
    props.editing = true
    const component = getConnectedWrapper()

    expect(component.find(ItemEdit).exists()).toBe(true)
  })
})
