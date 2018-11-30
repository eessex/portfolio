import React from 'react'
import { clone } from 'lodash'
import { mount } from 'enzyme'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { images } from 'client/tests/fixtures/components'
import { Image } from 'client/components/image/image'
import { ImageEdit } from 'client/components/image/image_edit'
import { RichText } from 'client/components/text/draft/RichText'
import { ImageRow, ImageContainer } from '../image_row'

describe('ImageRow', () => {
  const getWrapper = passedProps => {
    return mount(
      <ThemeProvider theme={theme}>
        <ImageRow {...passedProps} />
      </ThemeProvider>
    )
  }

  let props
  beforeEach(() => {
    props = {
      images: clone(images)
    }
  })

  it('Sets image width to 100% if length is 1', () => {
    props.images = [props.images[0]]
    const component = getWrapper(props)

    expect(component.find(ImageContainer).length).toBe(1)
    expect(component.find(Image).length).toBe(1)
    expect(component.find(ImageContainer).props().width).toBe('100%')
    expect(component.find(ImageContainer).props().hasGutter).toBeFalsy()
  })

  it('Resizes images if length is > 1', () => {
    const component = getWrapper(props)

    expect(component.find(ImageContainer).length).toBe(3)
    expect(component.find(Image).length).toBe(3)
    expect(component.find(ImageContainer).first().props().width).toBe('206px')
    expect(component.find(ImageContainer).last().props().width).toBe('369px')
  })

  it('Calls #onClick if provided', () => {
    props.onClick = jest.fn()
    const component = getWrapper(props)

    component.find(ImageContainer).last().simulate('click')
    expect(props.onClick).toBeCalledWith(2)
  })

  describe('Edit', () => {
    beforeEach(() => {
      props.onChange = jest.fn()
      props.onDelete = jest.fn()
    })

    it('shows EditImage if onChange and onDelete are provided', () => {
      const component = getWrapper(props)
      expect(component.find(ImageEdit).length).toBe(3)
    })

    it('Can edit an image caption', () => {
      const component = getWrapper(props)
      component.find(RichText).at(1).props().onChange('<p>New caption</p>')

      expect(props.onChange.mock.calls[0][0].caption).toBe('<p>New caption</p>')
    })

    it('Can delete an image', () => {
      const component = getWrapper(props)
      component.find('button').at(2).simulate('click')
      expect(props.onDelete).toBeCalledWith(2)
    })
  })
})
