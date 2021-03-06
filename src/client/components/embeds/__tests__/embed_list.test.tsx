import { embed_codes } from 'client/tests/fixtures/components'
import { mount } from 'enzyme'
import React from 'react'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { PlainText } from 'client/components/text/draft/PlainText'
import { EmbedList } from '../embed_list'
import { Embed } from '../embed'

describe('EmbedList', () => {
  let props
  const getElement = (passedProps = props) => {
    return mount(
      <ThemeProvider theme={theme}>
        <EmbedList {...passedProps} />
      </ThemeProvider>
    )
  }

  beforeEach(() => {
    props = {
      editing: false,
      embed_codes,
      hasNew: false,
      onChange: jest.fn()
    }
  })

  it('Renders a list of embeds', () => {
    const component = getElement()
    expect(component.find(Embed).length).toBe(3)
  })

  describe('Editing', () => {
    beforeEach(() => {
      props.editing = true
    })

    it('Renders a list of embeds', () => {
      const component = getElement()
      expect(component.find(Embed).length).toBe(3)
    })

    it('Can remove an embed', () => {
      const component = getElement()
      component.find('button').at(0).simulate('click')

      expect(props.onChange.mock.calls[0][0].length).toBe(2)
    })

    it('Shows new input if props.hasNew', () => {
      props.hasNew = true
      const component = getElement()

      expect(component.find(PlainText).length).toBe(1)
    })

    it('Can add a new embed', () => {
      props.hasNew = true
      const component = getElement()
      component.find(PlainText).getElement().props.onChange('<iframe>')

      expect(props.onChange.mock.calls[0][0].length).toBe(4)
    })
  })
})
