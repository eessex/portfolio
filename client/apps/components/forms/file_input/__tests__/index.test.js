import { mount } from 'enzyme'
import React from 'react'
import { FileInput } from '../index.jsx'

describe('FileInput', () => {
  let props = {}

  beforeEach(() => {
    props = {
      fetchUpload: jest.fn(),
      onChange: jest.fn()
    }
  })

  it('renders an upload prompt by default', () => {
    const component = mount(
      <FileInput {...props} />
    )
    expect(component.html()).toMatch('Click or Drag to Upload')
  })

  it('accepts images and video by default', () => {
    const component = mount(
      <FileInput {...props} />
    )
    expect(component.html()).toMatch('accept="image/*, video/mp4"')
  })

  it('can limit filetypes if props.accept', () => {
    props.accept = 'image/jpg'
    const component = mount(
      <FileInput {...props} />
    )
    expect(component.html()).toMatch('accept="image/jpg"')
  })

  it('shows a preview if props.hasPreview and props.file', () => {
    props.file = { url: 'image.jpg' }
    props.hasPreview = true
    const component = mount(
      <FileInput {...props} />
    )

    expect(component.html()).toMatch('<img src="image.jpg">')
    expect(component.html()).toMatch('opacity: 1')
    expect(component.html()).toMatch('fa-times')
  })

  it('can remove a preview image', () => {
    props.file = { url: 'image.jpg' }
    props.hasPreview = true
    props.onDelete = jest.fn()
    const component = mount(
      <FileInput {...props} />
    )

    const remove = component.find('.fa-times')
    remove.simulate('click')
    
    expect(props.onDelete.mock.calls.length).toBe(1)
  })

  it('sets state.dragover on dragEnter', () => {
    const component = mount(
      <FileInput {...props} />
    )
    const dragZone = component.find('.FileInput__drag-zone')
    dragZone.simulate('dragEnter')

    expect(component.state().isDragOver).toBe(true)
  })

  it('sets state.dragover on dragLeave', () => {
    props.accept = 'image/jpg'
    const component = mount(
      <FileInput {...props} />
    )
    component.instance().setState({isDragOver: true})
    const dragZone = component.find('.FileInput__drag-zone')
    dragZone.simulate('dragLeave')

    expect(component.state().isDragOver).toBe(false)
  })

  it('Calls props.fetchUpload when file is added', () => {
    const component = mount(
      <FileInput {...props} />
    )
    const input = component.find('input')
    input.simulate('change', { target: { files: ['files'], file: 'file' } } )

    expect(props.fetchUpload.mock.calls[0][0]).toBe('files')
    expect(props.fetchUpload.mock.calls[0][1]).toBe('file')
    expect(props.fetchUpload.mock.calls[0].length).toBe(3)
    expect(component.state().loading).toBe(true)
  })
})
