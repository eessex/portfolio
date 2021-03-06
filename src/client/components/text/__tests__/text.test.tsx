import { mount } from 'enzyme'
import React from 'react'
import { PlainText } from 'client/components/text/draft/PlainText'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { Text } from '../text'

describe('Text', () => {
  let props
  const getElement = (passedProps = props) => {
    return mount(
      <ThemeProvider theme={theme}>
        <Text {...passedProps} />
      </ThemeProvider>
    )
  }

  beforeEach(() => {
    props = {
      text: 'A cool string of text'
    }
  })

  it('Renders text when onChange not provided', () => {
    const component = getElement()
    expect(component.text()).toBe('A cool string of text')
  })

  it('Renders editable text when onChange is present', () => {
    props.onChange = jest.fn()
    const component = getElement()

    expect(component.text()).toBe('A cool string of text')
    expect(component.find(PlainText)).toHaveLength(1)
  })

  it('Renders a placeholder if no data', () => {
    props.text = ''
    props.onChange = jest.fn()
    const component = getElement()

    expect(component.text()).toBe('Start Typing...')
    expect(component.find(PlainText)).toHaveLength(1)
  })

  it('Renders a custom placeholder if no data', () => {
    props.text = ''
    props.onChange = jest.fn()
    props.placeholder = 'Add a title...'
    const component = getElement()

    expect(component.text()).toBe('Add a title...')
    expect(component.find(PlainText)).toHaveLength(1)
  })

  it('Responds to onClick if provided', () => {
    props.onClick = jest.fn()
    const component = getElement()
    component.simulate('click')

    expect(props.onClick).toBeCalled()
  })
})
