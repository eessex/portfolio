import { mount } from 'enzyme'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { Image } from '../image'

describe('Image', () => {
  const getWrapper = props => {
    return mount(
      <ThemeProvider theme={theme}>
        <Image {...props} />
      </ThemeProvider>
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

  it('Renders editCaption if present', () => {
    props.editCaption = <div>Hello</div>
    const component = getWrapper(props)
    expect(component.html()).toMatch('Hello')
  })
})
