import { mount } from 'enzyme'
import React from 'react'
import { LinksList } from '../LinksList'
import { links } from 'client/tests/fixtures/components'

describe('LinksList', () => {
  let props = { links }

  const getWrapper = (passedProps = props) => {
    return mount(
      <LinksList {...passedProps} />
    )
  }

  it('Renders a list of links', () => {
    const component = getWrapper()
    const renderedLinks = component.find('a')
    const firstLink = renderedLinks.first().getElement().props

    expect(renderedLinks.length).toBe(links.length)
    expect(firstLink.href).toMatch(links[0].url)
    expect(firstLink.children).toMatch(links[0].title)
  })
})
