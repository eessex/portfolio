import { mount } from 'enzyme'
import React from 'react'
import { Social } from '../social_list.jsx'

describe('Social', () => {
  const getWrapper = props => {
    return mount(
      <Social {...props} />
    )
  }

  let props
  beforeEach(() => {
    props = {
      onChange: jest.fn(),
      social: {
        bandcamp: 'my-profile',
        discogs: 'my-profile',
        soundcloud: 'my-profile',
        instagram: 'my-profile',
        facebook: 'my-profile',
        twitter: 'my-profile'
      }
    }
  })

  it('Renders all social profiles', () => {
    const component = getWrapper(props)

    expect(component.find('a')).toHaveLength(6)
    expect(component.text()).toMatch('Bandcamp')
    expect(component.text()).toMatch('Discogs')
    expect(component.text()).toMatch('Soundcloud')
    expect(component.text()).toMatch('Instagram')
    expect(component.text()).toMatch('Facebook')
    expect(component.text()).toMatch('Twitter')
  })

  it('Renders social icons', () => {
    const component = getWrapper(props)

    expect(component.html()).toMatch('fa-bandcamp')
    expect(component.html()).toMatch('fa-compact-disc')
    expect(component.html()).toMatch('fa-soundcloud')
    expect(component.html()).toMatch('fa-instagram')
    expect(component.html()).toMatch('fa-facebook')
    expect(component.html()).toMatch('fa-twitter')
  })

  it('Only renders active services', () => {
    props.social = {
      bandcamp: 'my-profile',
      discogs: 'my-profile'
    }
    const component = getWrapper(props)

    expect(component.find('a')).toHaveLength(2)
  })

  it('Renders Bandcamp', () => {
    props.social = { bandcamp: 'my-profile' }
    const link = getWrapper(props).find('a').getElement().props

    expect(link.children[1]).toBe('Bandcamp')
    expect(link.href).toBe('https://my-profile.bandcamp.com/')
  })

  it('Renders Discogs', () => {
    props.social = { discogs: 'my-profile' }
    const link = getWrapper(props).find('a').getElement().props

    expect(link.children[1]).toBe('Discogs')
    expect(link.href).toBe('https://discogs.com/my-profile')
  })

  it('Renders Soundcloud', () => {
    props.social = { soundcloud: 'my-profile' }
    const link = getWrapper(props).find('a').getElement().props

    expect(link.children[1]).toBe('Soundcloud')
    expect(link.href).toBe('https://soundcloud.com/my-profile')
  })

  it('Renders Instagram', () => {
    props.social = { instagram: 'my-profile' }
    const link = getWrapper(props).find('a').getElement().props

    expect(link.children[1]).toBe('Instagram')
    expect(link.href).toBe('https://instagram.com/my-profile')
  })

  it('Renders Facebook', () => {
    props.social = { facebook: 'my-profile' }
    const link = getWrapper(props).find('a').getElement().props

    expect(link.children[1]).toBe('Facebook')
    expect(link.href).toBe('https://facebook.com/my-profile')
  })

  it('Renders Twitter', () => {
    props.social = { twitter: 'my-profile' }
    const link = getWrapper(props).find('a').getElement().props

    expect(link.children[1]).toBe('Twitter')
    expect(link.href).toBe('https://twitter.com/my-profile')
  })
})
