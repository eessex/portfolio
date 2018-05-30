import { mount } from 'enzyme'
import React from 'react'
import { ImageShow } from '../image_show.jsx'

describe('ImageShow', () => {
  const getWrapper = props => {
    return mount(
      <ImageShow {...props} />
    )
  }

  let props = {
    aspect: 1,
    caption: '<p>A caption</p>',
    url: '/image.jpg'
  }

  it('Renders image', () => {
    const component = getWrapper(props)
    expect(component.find('img').getElement().props.src).toBe(props.url)
  })

  it('Renders caption', () => {
    const component = getWrapper(props)
    expect(component.html()).toMatch(props.caption)
  })

  it('Renders caption as image alt', () => {
    const component = getWrapper(props)
    expect(component.html()).toMatch('alt="A caption"')
  })
})
