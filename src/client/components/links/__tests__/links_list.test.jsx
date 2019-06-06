import { mount } from 'enzyme'
import React from 'react'
import { LinksList } from '../links_list.jsx'
import { links } from 'client/tests/fixtures/components'

describe('LinksList', () => {
  let props = links

  const getWrapper = (props) => {
    return mount(
      <LinksList links={props} />
    )
  }

  it('Renders a list of links', () => {
    const component = getWrapper(props)
    const renderedLinks = component.find('a')
    const firstLink = renderedLinks.first().getElement().props

    expect(renderedLinks.length).toBe(links.length)
    expect(firstLink.href).toMatch(links[0].url)
    expect(firstLink.children).toMatch(links[0].title)
  })
})
