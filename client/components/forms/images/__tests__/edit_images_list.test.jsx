import { mount } from 'enzyme'
import React from 'react'
import { EditImagesList } from '../edit_images_list.jsx'
import { FileInput } from '../../file_input/index.jsx'

describe('EditImagesList', () => {
  let props = {}

  const images = [
    {url: 'image1.jpg'},
    {url: 'image2.jpg'},
    {url: 'image3.jpg'}
  ]

  beforeEach(() => {
    props = {
      fetchUpload: jest.fn(),
      images: [],
      onChange: jest.fn()
    }
  })

  it('renders an upload prompt by default', () => {
    const component = mount(
      <EditImagesList {...props} />
    )

    expect(component.html()).toMatch('fa-plus')
    expect(component.html()).toMatch('Add Image')
    expect(component.html()).toMatch('Click or Drag to Upload')
  })

  it('renders a list of saved images', () => {
    props.images = images
    const component = mount(
      <EditImagesList {...props} />
    )

    expect(component.find('.EditImages__item').length).toBe(3)
    expect(component.find('img').length).toBe(3)
    expect(component.html()).toMatch('<img src="image2.jpg">')
    expect(component.find(FileInput).length).toBe(4)
  })

  it('can remove an image when clicking remove button', () => {
    props.images = images
    const component = mount(
      <EditImagesList {...props} />
    )
    component.find('.fa-times').first().simulate('click')

    expect(component.state().images.length).toBe(2)
    expect(props.onChange.mock.calls[0][0].length).toBe(2)
    expect(props.onChange.mock.calls[0][0][0].url).toBe('image2.jpg')
  })

  it('can add an image when clicking add button', () => {
    props.images = images
    const component = mount(
      <EditImagesList {...props} />
    )

    const input = component.find('.IconButton input')
    input.simulate('change', { target: { files: ['files'], file: 'file' } } )

    expect(props.fetchUpload.mock.calls[0][0]).toBe('files')
    expect(props.fetchUpload.mock.calls[0][1]).toBe('file')
    expect(props.fetchUpload.mock.calls[0].length).toBe(3)
  })
})
