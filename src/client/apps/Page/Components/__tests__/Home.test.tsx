import React from 'react'
import { mount } from 'enzyme'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { Home, PageBackground } from '../Home'

describe('Home', () => {
  const props = {
    page: {
      description: '<p>The page description</p>',
      images: [{
        url: 'http://mysite.com/image.jpg'
      }]
    }
  }
  const getWrapper = (passedProps = props) => {
    return mount(
      <ThemeProvider theme={theme}>
        <Home {...passedProps} />
      </ThemeProvider>
    )
  }

  it('Renders a background image', () => {
    const component = getWrapper()
    expect(component.find(PageBackground).getElement().props.backgroundImg).toBe(
      'http://mysite.com/image.jpg'
    )
  })

  it('Renders a page description', () => {
    const component = getWrapper()
    expect(component.text()).toMatch('The page description')
  })
})
