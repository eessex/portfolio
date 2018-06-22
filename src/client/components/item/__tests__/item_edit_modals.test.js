import { mount } from 'enzyme'
import configureStore from 'redux-mock-store'
import { Provider } from 'react-redux'
import React from 'react'
import { ItemEditModals } from '../item_edit_modals'
import { DatesModal } from '../../dates/dates_modal'
import { EmbedModal } from '../../embeds/embed_modal'
import { FormatsModal } from '../../formats/formats_modal'
import { ImagesEdit } from '../../images/images_edit'
import { LinksModal } from '../../links/links_modal'
import { VenueModal } from '../../venue/venue_modal'

describe('ItemEditModals', () => {
  const getWrapper = props => {
    const mockStore = configureStore([])
    const store = mockStore({
      item: props.item
    })

    return mount(
      <Provider store={store}>
        <ItemEditModals {...props} />
      </Provider>
    )
  }

  let props
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
    const component = getWrapper(props)

    expect(component.find(DatesModal).exists()).toBe(true)
  })

  it('Shows EmbedModal if isEditing is "embeds"', () => {
    props.isEditing = 'embeds'
    const component = getWrapper(props)

    expect(component.find(EmbedModal).exists()).toBe(true)
  })

  it('Shows FormatsModal if isEditing is "formats"', () => {
    props.isEditing = 'formats'
    const component = getWrapper(props)

    expect(component.find(FormatsModal).exists()).toBe(true)
  })

  it('Shows ImagesEdit if isEditing is "images"', () => {
    props.isEditing = 'images'
    props.fetchUpload = jest.fn()
    const component = getWrapper(props)

    expect(component.find(ImagesEdit).exists()).toBe(true)
  })

  it('Shows LinksModal if isEditing is "links"', () => {
    props.isEditing = 'links'
    const component = getWrapper(props)

    expect(component.find(LinksModal).exists()).toBe(true)
  })

  it('Shows VenueModal if isEditing is "venue"', () => {
    props.isEditing = 'venue'
    const component = getWrapper(props)

    expect(component.find(VenueModal).exists()).toBe(true)
  })
})