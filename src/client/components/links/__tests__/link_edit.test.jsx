import { mount } from 'enzyme'
import React from 'react'
import { Button } from 'client/components/Button'
import { links } from 'client/tests/fixtures/components'
import { LinkEdit } from '../link_edit'

describe('LinkEdit', () => {
  const getWrapper = props => {
    return mount(
      <LinkEdit {...props} />
    )
  }

  let props
  describe('New Link', () => {
    beforeEach(() => {
      props = {
        autoFocus: true,
        onDelete: jest.fn(),
        onChange: jest.fn()
      }
    })

    it('Renders expected fields', () => {
      const component = getWrapper(props)

      const titleInput = component.find('input').first().props()
      const urlInput = component.find('input').last().props()
      const button = component.find(Button)

      expect(titleInput.autoFocus).toBe(true)
      expect(titleInput.placeholder).toBe('Title')
      expect(titleInput.value).toBe('')

      expect(urlInput.autoFocus).toBe(undefined)
      expect(urlInput.placeholder).toBe('http://example.com')
      expect(urlInput.value).toBe('')

      expect(button.at(0).props().text).toBe('save')
    })

    it('Can edit a URL', () => {
      const component = getWrapper(props)
      const urlInput = component.find('input').last()
      const value = 'http://mylink.com'

      urlInput.simulate('change', {target: { value }})
      expect(component.state().link.url).toBe(value)
    })

    it('Can edit a title', () => {
      const component = getWrapper(props)
      const titleInput = component.find('input').first()
      const value = 'Cool link'

      titleInput.simulate('change', {target: { value }})
      expect(component.state().link.title).toBe(value)
    })

    it('Can save a link', () => {
      const component = getWrapper(props)
      const urlInput = component.find('input').last()
      const saveButton = component.find(Button).first()
      const value = 'http://mylink.com'

      urlInput.simulate('change', {target: { value }})
      saveButton.simulate('click')

      expect(props.onChange.mock.calls[0][0].url).toBe(value)
    })
  })

  describe('Saved Link', () => {
    const { title, url } = links[0]

    beforeEach(() => {
      props = {
        autoFocus: true,
        index: 2,
        onDelete: jest.fn(),
        onChange: jest.fn(),
        title,
        url
      }
    })

    it('Renders expected fields', () => {
      const component = getWrapper(props)
      const titleInput = component.find('input').first().props()
      const urlInput = component.find('input').last().props()
      const button = component.find(Button)

      expect(titleInput.autoFocus).toBe(true)
      expect(titleInput.placeholder).toBe('Title')
      expect(titleInput.value).toBe(title)

      expect(urlInput.autoFocus).toBe(undefined)
      expect(urlInput.placeholder).toBe('http://example.com')
      expect(urlInput.value).toBe(url)

      expect(button.at(0).props().icon).toBe('ban')
    })

    it('Can edit a URL', () => {
      const component = getWrapper(props)
      const urlInput = component.find('input').last()
      const value = 'http://mylink.com'
      urlInput.simulate('change', {target: { value }})

      expect(component.state().link.title).toBe(title)
      expect(component.state().link.url).toBe(value)
      expect(props.onChange.mock.calls[0][0].title).toBe(title)
      expect(props.onChange.mock.calls[0][0].url).toBe(value)
      expect(props.onChange.mock.calls[0][1]).toBe(props.index)
    })

    it('Can edit a title', () => {
      const component = getWrapper(props)
      const titleInput = component.find('input').first()
      const value = 'New Link'
      titleInput.simulate('change', {target: { value }})

      expect(component.state().link.title).toBe(value)
      expect(component.state().link.url).toBe(url)
      expect(props.onChange.mock.calls[0][0].title).toBe(value)
      expect(props.onChange.mock.calls[0][0].url).toBe(url)
      expect(props.onChange.mock.calls[0][1]).toBe(props.index)
    })

    it('Can delete a link', () => {
      const component = getWrapper(props)
      const deleteButton = component.find(Button).first()
      deleteButton.simulate('click')

      expect(props.onDelete.mock.calls[0][0]).toBe(props.index)
    })
  })
})
