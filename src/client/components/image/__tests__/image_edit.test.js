import { mount } from 'enzyme'
import React from 'react'
import { FileInput } from 'client/components/forms/file_input/index.jsx'
import { RichText } from 'client/components/text/draft/RichText'
import { ImageEdit } from '../image_edit.jsx'

describe('ImageEdit', () => {
  const getWrapper = props => {
    return mount(
      <ImageEdit {...props} />
    )
  }

  let props
  beforeEach(() => {
    props = {
      onChange: jest.fn(),
      item: {
        aspect: 1,
        caption: 'A caption',
        url: '/image.jpg'
      },
      fetchUpload: jest.fn()
    }
  })

  it('Renders existing image with remove button', () => {
    const component = getWrapper(props)
    expect(component.find('img').getElement().props.src).toBe(props.item.url)
    expect(component.find('Button').exists()).toBe(true)
  })

  it('Renders caption if props.editCaption', () => {
    props.editCaption = true
    const component = getWrapper(props)
    expect(component.text()).toMatch(props.item.caption)
    expect(component.find(RichText).exists()).toBe(true)
  })

  it('Renders file input if props.showInput', () => {
    props.showInput = true
    const component = getWrapper(props)
    expect(component.find(FileInput).exists()).toBe(true)
  })

  it('Can remove an existing single image', () => {
    const component = getWrapper(props)
    component.find('button').simulate('click')
    expect(props.onChange.mock.calls.length).toBe(1)
  })

  it('Can remove an existing image from an array', () => {
    props.onDelete = jest.fn()
    props.index = 2
    const component = getWrapper(props)
    component.find('button').simulate('click')
    expect(props.onDelete.mock.calls[0][0]).toBe(props.index)
  })

  it('Can upload a new image', () => {
    const file = { target: { files: ['files'], file: 'file' } }
    props.showInput = true
    const component = getWrapper(props)
    component.find('input').simulate('change', file)
    expect(props.fetchUpload.mock.calls[0][0]).toBe(file.target.files[0])
    expect(props.fetchUpload.mock.calls[0][1]).toBe(file.target.file)
  })

  it('Can edit an image caption', () => {
    props.editCaption = true
    const component = getWrapper(props)
    component.instance().onChangeText('<p>A new caption</p>')
    const newImage = props.onChange.mock.calls[0][0]
    expect(newImage.url).toBe(props.item.url)
    expect(newImage.caption).toBe('<p>A new caption</p>')
  })
})
