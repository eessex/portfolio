import { cloneDeep } from 'lodash'
import { mount } from 'enzyme'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { Venue as VenueFixture } from 'client/tests/fixtures/components'
import { Venue, VenueContainer } from '../Venue'

describe('Venue', () => {
  const getWrapper = passedProps => {
    return mount(
      <ThemeProvider theme={theme}>
        <Venue {...passedProps} />
      </ThemeProvider>
    )
  }

  let props
  beforeEach(() => {
    props = {
      venue: cloneDeep(VenueFixture)
    }
  })

  it('Renders all fields', () => {
    const component = getWrapper(props)
    expect(component.text()).toMatch('National Arts Club15 Gramercy Park S.New York, NY USA')
  })

  it('Can handle empty venue names', () => {
    delete props.venue.name
    const component = getWrapper(props)
    expect(component.text()).toBe('15 Gramercy Park S.New York, NY USA')
  })

  it('Can handle empty street address', () => {
    delete props.venue.address
    const component = getWrapper(props)
    expect(component.text()).toBe('National Arts ClubNew York, NY USA')
  })

  it('Can handle missing city', () => {
    delete props.venue.city
    const component = getWrapper(props)
    expect(component.text()).toMatch('National Arts Club15 Gramercy Park S.NY USA')
  })

  it('Can handle missing state', () => {
    delete props.venue.state
    const component = getWrapper(props)
    expect(component.text()).toMatch('National Arts Club15 Gramercy Park S.New York USA')
  })

  it('Can handle missing country', () => {
    delete props.venue.country
    const component = getWrapper(props)
    expect(component.text()).toMatch('National Arts Club15 Gramercy Park S.New York, NY')
  })

  it('Can handle missing city & country', () => {
    delete props.venue.city
    delete props.venue.country
    const component = getWrapper(props)
    expect(component.text()).toMatch('National Arts Club15 Gramercy Park S.NY')
  })

  it('Can handle missing state & country', () => {
    delete props.venue.state
    delete props.venue.country
    const component = getWrapper(props)
    expect(component.text()).toMatch('National Arts Club15 Gramercy Park S.New York')
  })

  it('Can handle missing state & city', () => {
    delete props.venue.city
    delete props.venue.state
    const component = getWrapper(props)
    expect(component.text()).toMatch('National Arts Club15 Gramercy Park S.USA')
  })

  describe('Editing', () => {
    beforeEach(() => {
      props.onClick = jest.fn()
    })

    it('Shows a placeholder if props.onClick and venue is empty', () => {
      props.venue = null
      const component = getWrapper(props)
      expect(component.text()).toMatch('Add Venue')
    })

    it('Calls onClick on venue click', () => {
      const component = getWrapper(props)
      component.find(VenueContainer).simulate('click')
      expect(props.onClick).toBeCalled()
    })
  })
})
