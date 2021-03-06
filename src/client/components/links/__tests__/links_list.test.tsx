import { mount } from 'enzyme'
import React from 'react'
import { LinksList } from '../links_list'
import { links } from 'client/tests/fixtures/components'

describe('LinksList', () => {
  let props

  const getWrapper = (passedProps = props) => {
    return mount(
      <LinksList links={passedProps} />
    )
  }

  beforeEach(() => {
    props = links
  })

  it('Renders a list of links', () => {
    const component = getWrapper()
    const renderedLinks = component.find('a')
    const firstLink = renderedLinks.first().getElement().props

    expect(renderedLinks.length).toBe(links.length)
    expect(firstLink.href).toMatch(links[0].url)
    expect(firstLink.children).toMatch(links[0].title)
  })
})
