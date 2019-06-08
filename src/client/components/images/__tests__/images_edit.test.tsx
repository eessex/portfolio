import React from 'react'
import { mount } from 'enzyme'
import { clone, extend, map } from 'lodash'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { ImageEdit } from 'client/components/image/image_edit'
import { ModalBackgroundContainer } from 'client/components/modal/modal_background'
import {
  images as imagesFixture,
  imagesLong as imagesLongFixture
} from 'client/tests/fixtures/components'
import { ImageGrid } from '../image_grid/image_grid'
import { ImageRow } from '../image_grid/image_row'
import { ImagesEdit } from '../images_edit'

describe('ImageEdit', () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(
      <ThemeProvider theme={theme}>
        <ImagesEdit {...passedProps} />
      </ThemeProvider>
    )
  }

  beforeEach(() => {
    props = {
      fetchUpload: jest.fn(),
      item: { images: clone(imagesFixture) },
      onChange: jest.fn(),
      setEditing: jest.fn()
    }
  })

  describe('Rendering', () => {
    it('It renders with empty images', () => {
      delete props.item.images
      const component = getWrapper()
      expect(component.find('label').text()).toMatch('Images')
      expect(component.text()).toMatch('Click or Drag to Upload')
      expect(component.find(ImageEdit).length).toBe(1)
      expect(component.find(ImageGrid).length).toBe(0)
      expect(component.find(ImageRow).length).toBe(0)
    })

    it('It renders with saved data', () => {
      const component = getWrapper()

      expect(component.text()).toMatch('Click or Drag to Upload')
      expect(component.find(ImageEdit).length).toBe(4)
      expect(component.find(ImageGrid).length).toBe(1)
      expect(component.find(ImageRow).length).toBe(1)
    })

    it('It renders with many images', () => {
      props.item.images = clone(imagesLongFixture)
      const component = getWrapper()

      expect(component.text()).toMatch('Click or Drag to Upload')
      expect(component.find(ImageEdit).length).toBe(6)
      expect(component.find(ImageGrid).length).toBe(1)
      expect(component.find(ImageRow).length).toBe(2)
    })
  })

  it('#onChangeImage change an existing image', () => {
    let newImage = extend(props.item.images[1], {
      caption: '<p>New caption</p>'
    })
    const component = getWrapper().find(ImagesEdit).instance()
    component.onChangeImage(newImage, 1)
    const newImages = props.onChange.mock.calls[0][0]

    expect(newImages.length).toBe(3)
    expect(newImages[1].url).toBe(props.item.images[1].url)
    expect(newImages[1].caption).toBe(newImage.caption)
  })

  it('#onNewImage pushes a new image into item.images', () => {
    let newImage = {
      url: 'http://site.com/image.jpg',
      caption: '<p>New caption</p>',
      aspect: 1.2
    }
    const component = getWrapper(props).find(ImagesEdit).instance()
    component.onNewImage(newImage)
    const newImages = props.onChange.mock.calls[0][0]

    expect(newImages.length).toBe(4)
    expect(newImages[3].url).toBe(newImage.url)
    expect(newImages[3].caption).toBe(newImage.caption)
  })

  it('#onDeleteImage removes an image by index', () => {
    const removedImage = props.item.images[1]
    const component = getWrapper().find(ImagesEdit).instance()
    component.onDeleteImage(1)
    const newImages = props.onChange.mock.calls[0][0]

    expect(newImages.length).toBe(2)
    expect(map(newImages, 'url').includes(removedImage.url)).toBeFalsy()
  })

  it('Calls #setEditing when closing modal', () => {
    const component = getWrapper()
    component.find(ModalBackgroundContainer).simulate('click')
    expect(props.setEditing).toBeCalledWith(null)
  })
})
