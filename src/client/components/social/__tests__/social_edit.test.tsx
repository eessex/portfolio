import { mount } from 'enzyme'
import React from 'react'
import { SocialEdit, SocialItem } from '../social_edit'

describe('SocialEdit', () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(
      <SocialEdit {...passedProps} />
    )
  }

  beforeEach(() => {
    props = {
      onChange: jest.fn(),
      social: {}
    }
  })

  it('Renders all possible social options', () => {
    const component = getWrapper()

    expect(component.find(SocialItem)).toHaveLength(6)
    expect(component.text()).toMatch('Bandcamp')
    expect(component.text()).toMatch('Discogs')
    expect(component.text()).toMatch('Soundcloud')
    expect(component.text()).toMatch('Instagram')
    expect(component.text()).toMatch('Facebook')
    expect(component.text()).toMatch('Twitter')
  })

  it('Renders social icons', () => {
    const component = getWrapper()

    expect(component.html()).toMatch('fa-bandcamp')
    expect(component.html()).toMatch('fa-compact-disc')
    expect(component.html()).toMatch('fa-soundcloud')
    expect(component.html()).toMatch('fa-instagram')
    expect(component.html()).toMatch('fa-facebook')
    expect(component.html()).toMatch('fa-twitter')
  })

  describe('Bandcamp', () => {
    it('Renders the edit panel on click', () => {
      const component = getWrapper()
      component.find(SocialItem).at(0).simulate('click')

      expect(component.state().isEditing).toBe('bandcamp')
    })

    it('Can edit profile handle', () => {
      const component = getWrapper()
      component.find(SocialItem).at(0).simulate('click')
      const input = component.find('input').at(0)
      expect(input.getElement().props.placeholder).toBe('username')

      input.simulate('change', {target: {value: 'my-name'}})
      expect(props.onChange.mock.calls[0][0]).toBe('social')
      expect(props.onChange.mock.calls[0][1].bandcamp).toBe('my-name')
    })
  })

  describe('Discogs', () => {
    it('Renders the edit panel on click', () => {
      const component = getWrapper()
      component.find(SocialItem).at(1).simulate('click')

      expect(component.state().isEditing).toBe('discogs')
    })

    it('Can edit profile handle', () => {
      const component = getWrapper()
      component.find(SocialItem).at(1).simulate('click')
      const input = component.find('input').at(0)
      expect(input.getElement().props.placeholder).toBe('username')

      input.simulate('change', {target: {value: 'my-name'}})
      expect(props.onChange.mock.calls[0][0]).toBe('social')
      expect(props.onChange.mock.calls[0][1].discogs).toBe('my-name')
    })
  })

  describe('Soundcloud', () => {
    it('Renders the edit panel on click', () => {
      const component = getWrapper()
      component.find(SocialItem).at(2).simulate('click')

      expect(component.state().isEditing).toBe('soundcloud')
    })

    it('Can edit profile handle', () => {
      const component = getWrapper()
      component.find(SocialItem).at(2).simulate('click')
      const input = component.find('input').at(0)
      expect(input.getElement().props.placeholder).toBe('username')

      input.simulate('change', {target: {value: 'my-name'}})
      expect(props.onChange.mock.calls[0][0]).toBe('social')
      expect(props.onChange.mock.calls[0][1].soundcloud).toBe('my-name')
    })
  })

  describe('Facebook', () => {
    it('Renders the edit panel on click', () => {
      const component = getWrapper()
      component.find(SocialItem).at(3).simulate('click')

      expect(component.state().isEditing).toBe('facebook')
    })

    it('Can edit profile handle', () => {
      const component = getWrapper()
      component.find(SocialItem).at(3).simulate('click')
      const input = component.find('input').at(0)
      expect(input.getElement().props.placeholder).toBe('username')

      input.simulate('change', {target: {value: 'my-name'}})
      expect(props.onChange.mock.calls[0][0]).toBe('social')
      expect(props.onChange.mock.calls[0][1].facebook).toBe('my-name')
    })
  })

  describe('Instagram', () => {
    it('Renders the edit panel on click', () => {
      const component = getWrapper()
      component.find(SocialItem).at(4).simulate('click')

      expect(component.state().isEditing).toBe('instagram')
    })

    it('Can edit profile handle', () => {
      const component = getWrapper()
      component.find(SocialItem).at(4).simulate('click')
      const input = component.find('input').at(0)
      expect(input.getElement().props.placeholder).toBe('username')

      input.simulate('change', {target: {value: 'my-name'}})
      expect(props.onChange.mock.calls[0][0]).toBe('social')
      expect(props.onChange.mock.calls[0][1].instagram).toBe('my-name')
    })
  })

  describe('Twitter', () => {
    it('Renders the edit panel on click', () => {
      const component = getWrapper()
      component.find(SocialItem).at(5).simulate('click')

      expect(component.state().isEditing).toBe('twitter')
    })

    it('Can edit profile handle', () => {
      const component = getWrapper()
      component.find(SocialItem).at(5).simulate('click')
      const input = component.find('input').at(0)
      expect(input.getElement().props.placeholder).toBe('username')

      input.simulate('change', {target: {value: 'my-name'}})
      expect(props.onChange.mock.calls[0][0]).toBe('social')
      expect(props.onChange.mock.calls[0][1].twitter).toBe('my-name')
    })
  })
})
