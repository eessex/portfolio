import { mount } from 'enzyme'
import React from 'react'
import { LinkEdit } from '../link_edit'
import { LinksEdit } from '../links_edit'
import { links } from 'client/tests/fixtures/components'

describe('LinksEdit', () => {
  let props

  const getWrapper = (passedProps = props) => {
    return mount(
      <LinksEdit {...passedProps} />
    )
  }

  beforeEach(() => {
    props = {
      links,
      onChange: jest.fn()
    }
  })

  it('Renders a new link field', () => {
    const component = getWrapper()
    const newLink = component.find(LinkEdit).last().props()

    expect(newLink.url).toBe("")
    expect(newLink.title).toBe(undefined)
  })

  it('Renders a list of existing links', () => {
    const component = getWrapper()
    const renderedLinks = component.find(LinkEdit)
    const { links } = props

    expect(renderedLinks.length).toBe(links.length + 1)
    expect(renderedLinks.first().props().url).toBe(links[0].url)
    expect(renderedLinks.first().props().title).toBe(links[0].title)
  })

  it('Autofocuses the first link if has links', () => {
    const component = getWrapper()
    const link = component.find(LinkEdit).first().props()

    expect(link.autoFocus).toBe(true)
  })

  it('Autofocuses the first link if no links', () => {
    props.links = []
    const component = getWrapper()
    const link = component.find(LinkEdit).first().props()

    expect(link.autoFocus).toBe(true)
  })

  it('#onChange can change an existing link', () => {
    const component = getWrapper()
    const input = component.find(LinkEdit).first().find('input').first()
    const value = 'Cool thing'

    input.props().onChange({target: { value }}, 0)
    expect(props.onChange.mock.calls[0][0][0].title).toBe(value)
  })

  it('#onChange can add a new link', () => {
    const component = getWrapper()
    const inputs = component.find(LinkEdit).last().find('input')
    const saveButton = component.find(LinkEdit).last().find('button').first()
    const title = 'Cool thing'
    const url = 'http://thing.com'

    inputs.first().simulate('change', {target: { value: title }})
    inputs.last().simulate('change', {target: { value: url }})
    saveButton.simulate('click')

    expect(props.onChange.mock.calls[0][0][2].title).toBe(title)
    expect(props.onChange.mock.calls[0][0][2].url).toBe(url)
    expect(props.onChange.mock.calls[0][0].length).toBe(links.length + 1)
  })

  it('#onDelete can delete an existing link', () => {
    const component = getWrapper()
    const deleteButton = component.find(LinkEdit).first().find('button')
    const deleted = props.links[0]

    deleteButton.simulate('click')
    expect(props.onChange.mock.calls[0][0][0].title).not.toBe(deleted.title)
    expect(props.onChange.mock.calls[0][0][0].url).not.toBe(deleted.url)
    expect(props.onChange.mock.calls[0][0].length).toBe(props.links.length - 1)
  })

  it('#checkEmpty deletes links with no url', () => {
    props.links = [{title: 'A Link', url: ''}]
    const component = getWrapper()
    const cleanedLinks = component.instance().checkEmpty()

    expect(cleanedLinks.length).toBe(0)
  })

  it('#componentWillUnmount calls #checkEmpty', () => {
    props.links = [{title: 'A Link', url: ''}]
    const component = getWrapper()
    component.instance().componentWillUnmount()

    expect(props.onChange.mock.calls[0][0].length).toBe(0)
  })
})
