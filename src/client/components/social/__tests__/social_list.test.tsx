import { mount } from 'enzyme'
import React from 'react'
import { Social } from '../social_list'

describe('Social', () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(
      <Social {...passedProps} />
    )
  }

  beforeEach(() => {
    props = {
      onChange: jest.fn(),
      social: [
        {
          service: 'bandcamp',
          profile: 'my-profile'
        },
        {
          service: 'discogs',
          profile: 'my-profile'
        },
        {
          service: 'soundcloud',
          profile: 'my-profile'
        },
        {
          service: 'instagram',
          profile: 'my-profile'
        },
        {
          service: 'facebook',
          profile: 'my-profile'
        },
        {
          service: 'twitter',
          profile: 'my-profile'
        }
      ]
    }
  })

  it('Renders all social profiles', () => {
    const component = getWrapper()

    expect(component.find('a')).toHaveLength(6)
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

  it('Only renders active services', () => {
    props.social = [
      {
        service: 'bandcamp',
        profile: 'my-profile'
      },
      {
        service: 'discogs',
        profile: 'my-profile'
      }
    ]
    const component = getWrapper()

    expect(component.find('a')).toHaveLength(2)
  })

  it('Renders Bandcamp', () => {
    props.social = [{
      service: 'bandcamp',
      profile: 'my-profile'
    }]
    const link = getWrapper().find('a').getElement().props

    expect(link.children[1]).toBe('Bandcamp')
    expect(link.href).toBe('https://my-profile.bandcamp.com/')
  })

  it('Renders Discogs', () => {
    props.social = [{
      service: 'discogs',
      profile: 'my-profile'
    }]
    const link = getWrapper().find('a').getElement().props

    expect(link.children[1]).toBe('Discogs')
    expect(link.href).toBe('https://discogs.com/my-profile')
  })

  it('Renders Soundcloud', () => {
    props.social = [{
      service: 'soundcloud',
      profile: 'my-profile'
    }]
    const link = getWrapper().find('a').getElement().props

    expect(link.children[1]).toBe('Soundcloud')
    expect(link.href).toBe('https://soundcloud.com/my-profile')
  })

  it('Renders Instagram', () => {
    props.social = [{
      service: 'instagram',
      profile: 'my-profile'
    }]
    const link = getWrapper().find('a').getElement().props

    expect(link.children[1]).toBe('Instagram')
    expect(link.href).toBe('https://instagram.com/my-profile')
  })

  it('Renders Facebook', () => {
    props.social = [{
      service: 'facebook',
      profile: 'my-profile'
    }]
    const link = getWrapper().find('a').getElement().props

    expect(link.children[1]).toBe('Facebook')
    expect(link.href).toBe('https://facebook.com/my-profile')
  })

  it('Renders Twitter', () => {
    props.social = [{
      service: 'twitter',
      profile: 'my-profile'
    }]
    const link = getWrapper().find('a').getElement().props

    expect(link.children[1]).toBe('Twitter')
    expect(link.href).toBe('https://twitter.com/my-profile')
  })
})
