import React from 'react'
import { clone, flatten } from 'lodash'
import { mount } from 'enzyme'
import { images, imagesLong } from 'client/tests/fixtures/components'
import { ImageRow, ImageContainer } from '../image_row'
import { ThemeProvider } from 'styled-components'
import { theme } from 'client/styles/theme'
import { ImageGrid, getFirstRowLength, getRows } from '../image_grid'

describe('ImageGrid', () => {
  let props
  const getWrapper = (passedProps = props) => {
    return mount(
      <ThemeProvider theme={theme}>
        <ImageGrid {...passedProps} />
      </ThemeProvider>
    )
  }

  beforeEach(() => {
    props = {
      images: clone(images),
      onChange: jest.fn(),
      onDelete: jest.fn()
    }
  })

  describe('Rendering', () => {
    it('Renders all images', () => {
      const component = getWrapper()

      expect(component.find(ImageContainer).length).toBe(3)
      expect(component.html()).toMatch(props.images[2].url)
    })

    it('Can render rows of images', () => {
      props.images = clone(imagesLong)
      const component = getWrapper()

      expect(component.find(ImageRow).length).toBe(2)
      expect(component.find(ImageContainer).length).toBe(5)
      expect(component.html()).toMatch(props.images[4].url)
    })

    it('Skips first image if hasCover', () => {
      props.hasCover = true
      const component = getWrapper()

      expect(component.find(ImageContainer).length).toBe(2)
      expect(component.html()).not.toMatch(props.images[0].url)
      expect(component.html()).toMatch(props.images[1].url)
    })
  })

  describe('#getImageRows', () => {
    it('Can handle single image', () => {
      props.images = [images[0]]
      const component = getWrapper()
      const setImages = component.find(ImageGrid).instance().getImageRows()

      expect(setImages.displayImages).toEqual([images[0]])
      expect(setImages.increment).toBe(0)
      expect(setImages.firstRow).toEqual([images[0]])
      expect(setImages.secondRow).toBeFalsy()
    })

    it('Can handle single image with cover', () => {
      props.images = [images[0]]
      props.hasCover = true
      const component = getWrapper()
      const setImages = component.find(ImageGrid).instance().getImageRows()

      expect(setImages.displayImages).toEqual([])
      expect(setImages.increment).toBe(1)
      expect(setImages.firstRow).toEqual([])
      expect(setImages.secondRow).toBeFalsy()
    })

    it('Can handle a single row of images', () => {
      const component = getWrapper()
      const setImages = component.find(ImageGrid).instance().getImageRows()

      expect(setImages.displayImages).toEqual(props.images)
      expect(setImages.increment).toBe(0)
      expect(setImages.firstRow).toEqual(props.images)
      expect(setImages.secondRow).toBeFalsy()
    })

    describe('Grid with multiple rows', () => {
      beforeEach(() => {
        props.images = clone(imagesLong)
      })

      it('Can create rows of images', () => {
        props.images.splice(0, 1)
        const component = getWrapper()
        const setImages = component.find(ImageGrid).instance().getImageRows()

        expect(setImages.displayImages).toEqual(props.images)
        expect(setImages.increment).toBe(0)
        expect(setImages.firstRow).toEqual([props.images[0], props.images[1]])
        expect(setImages.secondRow).toEqual([props.images[2], props.images[3]])
      })

      it('Can handle odd rows images', () => {
        const component = getWrapper()
        const setImages = component.find(ImageGrid).instance().getImageRows()

        expect(setImages.displayImages).toEqual(props.images)
        expect(setImages.increment).toBe(0)
        expect(setImages.firstRow).toEqual([props.images[0], props.images[1]])
        expect(setImages.secondRow).toEqual([props.images[2], props.images[3], props.images[4]])
      })

      it('Can handle event rows of images', () => {
        props.images.push(clone(images[0]))
        const component = getWrapper()
        const setImages = component.find(ImageGrid).instance().getImageRows()

        expect(setImages.displayImages).toEqual(props.images)
        expect(setImages.increment).toBe(0)
        expect(setImages.firstRow).toEqual([props.images[0], props.images[1], props.images[2]])
        expect(setImages.secondRow).toEqual([props.images[3], props.images[4], props.images[5]])
      })
    })
  })

  describe('#getTrueIndex', () => {
    beforeEach(() => {
      props.images = clone(imagesLong)
    })

    it('returns index for first row', () => {
      const component = getWrapper()
      const getTrueIndex = component.find(ImageGrid).instance().getTrueIndex(2)

      expect(getTrueIndex).toBe(2)
    })

    it('returns index for first row with cover', () => {
      props.hasCover = true
      const component = getWrapper()
      const getTrueIndex = component.find(ImageGrid).instance().getTrueIndex(2)

      expect(getTrueIndex).toBe(3)
    })

    it('returns index for second row', () => {
      const component = getWrapper()
      const getTrueIndex = component.find(ImageGrid).instance().getTrueIndex(2, true)

      expect(getTrueIndex).toBe(4)
    })

    it('returns index for second row with cover', () => {
      props.hasCover = true
      const component = getWrapper()
      const getTrueIndex = component.find(ImageGrid).instance().getTrueIndex(2, true)

      expect(getTrueIndex).toBe(5)
    })
  })

  describe('#onChange', () => {
    beforeEach(() => {
      props.images = clone(imagesLong)
    })

    it('Updates image in first row', () => {
      const image = clone(props.images[0])
      image.caption = '<p>New caption.</p>'
      const component = getWrapper()
      component.find(ImageGrid).instance().onChange(image, 0)

      expect(props.onChange.mock.calls[0][0].caption).toBe('<p>New caption.</p>')
      expect(props.onChange.mock.calls[0][1]).toBe(0)
    })

    it('Updates image in first row with cover', () => {
      const image = clone(props.images[0])
      image.caption = '<p>New caption.</p>'
      props.hasCover = true
      const component = getWrapper()
      component.find(ImageGrid).instance().onChange(image, 0)

      expect(props.onChange.mock.calls[0][0].caption).toBe('<p>New caption.</p>')
      expect(props.onChange.mock.calls[0][1]).toBe(1)
    })

    it('Updates image in second row', () => {
      const image = clone(props.images[0])
      image.caption = '<p>New caption.</p>'
      const component = getWrapper()
      component.find(ImageGrid).instance().onChange(image, 2, true)

      expect(props.onChange.mock.calls[0][0].caption).toBe('<p>New caption.</p>')
      expect(props.onChange.mock.calls[0][1]).toBe(4)
    })

    it('Updates image in second row with cover', () => {
      const image = clone(props.images[0])
      image.caption = '<p>New caption.</p>'
      props.hasCover = true
      const component = getWrapper()
      component.find(ImageGrid).instance().onChange(image, 2, true)

      expect(props.onChange.mock.calls[0][0].caption).toBe('<p>New caption.</p>')
      expect(props.onChange.mock.calls[0][1]).toBe(5)
    })
  })

  describe('#onDelete', () => {
    beforeEach(() => {
      props.images = clone(imagesLong)
    })

    it('Removes image in first row', () => {
      const component = getWrapper()
      component.find(ImageGrid).instance().onDelete(0)

      expect(props.onDelete.mock.calls[0][0]).toBe(0)
    })

    it('Removes image in first row with cover', () => {
      props.hasCover = true
      const component = getWrapper()
      component.find(ImageGrid).instance().onDelete(0)

      expect(props.onDelete.mock.calls[0][0]).toBe(1)
    })

    it('Removes image in second row', () => {
      const component = getWrapper()
      component.find(ImageGrid).instance().onDelete(2, true)

      expect(props.onDelete.mock.calls[0][0]).toBe(4)
    })

    it('Removes image in second row with cover', () => {
      props.hasCover = true
      const component = getWrapper()
      component.find(ImageGrid).instance().onDelete(2, true)

      expect(props.onDelete.mock.calls[0][0]).toBe(5)
    })
  })

  describe('#getFirstRowLength', () => {
    const image = clone(images[0])

    it('Returns 0 by default', () => {
      const firstRowLength = getFirstRowLength()

      expect(firstRowLength).toBe(0)
    })

    it('Returns half of length for even rows', () => {
      let input = flatten([images, image])
      const firstRowLength = getFirstRowLength(input)

      expect(firstRowLength).toBe(2)
      expect(firstRowLength).toBe(input.length / 2)
    })

    it('Returns third of length for rows divisible by three', () => {
      let input = flatten([imagesLong, images, image])
      const firstRowLength = getFirstRowLength(input)

      expect(firstRowLength).toBe(input.length / 3)
      expect(firstRowLength).toBe(3)
    })

    it('Returns 2 if length is 5', () => {
      const firstRowLength = getFirstRowLength(imagesLong)

      expect(firstRowLength).toBe(2)
    })

    it('Returns 3 if length is 7', () => {
      const firstRowLength = getFirstRowLength(flatten([imagesLong, image, image]))

      expect(firstRowLength).toBe(3)
    })
  })

  describe('#getRows', () => {
    const image = images[0]

    it('Returns correct increments for even arrays', () => {
      const input = flatten([images, image])
      const { firstRow, secondRow, increment } = getRows(input)

      expect(firstRow.length).toBe(2)
      expect(secondRow.length).toBe(2)
      expect(increment).toBe(2)
    })

    it('Returns correct increments for arrays divisible by three', () => {
      const { firstRow, secondRow, increment } = getRows(flatten([imagesLong, image]))

      expect(firstRow.length).toBe(3)
      expect(secondRow.length).toBe(3)
      expect(increment).toBe(3)
    })

    it('Returns correct increments for arrays of 5', () => {
      const { firstRow, secondRow, increment } = getRows(imagesLong)

      expect(firstRow.length).toBe(2)
      expect(secondRow.length).toBe(3)
      expect(increment).toBe(2)
    })

    it('Returns rows for 7 images', () => {
      const { firstRow, secondRow, increment } = getRows(flatten([imagesLong, image, image]))

      expect(firstRow.length).toBe(3)
      expect(secondRow.length).toBe(4)
      expect(increment).toBe(3)
    })
  })
})
