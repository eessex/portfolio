import { mount } from 'enzyme'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { DatesModal } from 'client/components/dates/dates_modal'
import { EmbedModal } from 'client/components/embeds/embed_modal'
import { FormatsModal } from 'client/components/formats/formats_modal'
import { ImagesEdit } from 'client/components/images/images_edit'
import { LinksModal } from 'client/components/links/links_modal'
import { VenueModal } from 'client/components/venue/venue_modal'
import { ItemEditModals } from '../item_edit_modals'

describe('ItemEditModals', () => {
  let props
  const getWrapper = (passedProps = props) => {
    const mockStore = configureStore([])
    const store = mockStore({
      item: passedProps.item
    })

    return mount(
      <Provider store={store}>
        <ThemeProvider theme={theme}>
          <ItemEditModals {...passedProps} />
        </ThemeProvider>
      </Provider>
    )
  }

  beforeEach(() => {
    props = {
      isEditing: null,
      setEditing: jest.fn(),
      onChange: jest.fn(),
      item: {
        item: {},
        isSaved: true,
        isSaving: false
      }
    }
  })

  it('Shows DatesModal if isEditing is "dates"', () => {
    props.isEditing = 'dates'
    const component = getWrapper()

    expect(component.find(DatesModal).exists()).toBe(true)
  })

  it('Shows EmbedModal if isEditing is "embed_codes"', () => {
    props.isEditing = 'embed_codes'
    const component = getWrapper()

    expect(component.find(EmbedModal).exists()).toBe(true)
  })

  it('Shows FormatsModal if isEditing is "formats"', () => {
    props.isEditing = 'formats'
    const component = getWrapper()

    expect(component.find(FormatsModal).exists()).toBe(true)
  })

  it('Shows ImagesEdit if isEditing is "images"', () => {
    props.isEditing = 'images'
    props.fetchUploadAction = jest.fn()
    const component = getWrapper()

    expect(component.find(ImagesEdit).exists()).toBe(true)
  })

  it('Shows LinksModal if isEditing is "links"', () => {
    props.isEditing = 'links'
    const component = getWrapper()

    expect(component.find(LinksModal).exists()).toBe(true)
  })

  it('Shows VenueModal if isEditing is "venue"', () => {
    props.isEditing = 'venue'
    const component = getWrapper()

    expect(component.find(VenueModal).exists()).toBe(true)
  })
})
