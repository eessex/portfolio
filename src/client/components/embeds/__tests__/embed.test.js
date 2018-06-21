import { embed_codes } from 'client/tests/fixtures/components'
import { mount } from 'enzyme'
import React from 'react'
import { Embed } from '../embed'

describe('Embed', () => {
  let props = {
    embed_code: embed_codes[0]
  }

  it('Renders an iframe', () => {
    const component = mount(
      <Embed {...props} />
    )
    expect(component.html()).toMatch('<iframe')
  })
})
