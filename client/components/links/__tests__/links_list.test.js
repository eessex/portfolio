import { mount } from 'enzyme'
import React from 'react'
import { LinksList } from '../links_list.jsx'
import { links } from '../../../tests/fixtures/components.js'

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

    expect(renderedLinks.length).toBe(links.length)
    expect(renderedLinks.first().node.href).toMatch(links[0].url)
    expect(renderedLinks.first().text()).toMatch(links[0].title)
  })
})
