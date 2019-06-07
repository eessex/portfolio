import { mount } from 'enzyme'
import React from 'react'
import { Modal } from '../modal'
import { ModalBackground } from '../modal_background'

describe('Modal', () => {
  const getWrapper = () => {
    return mount(
      <Modal onClick={jest.fn()}>
        <div>A child component</div>
      </Modal>
    )
  }

  it('Renders children and background', () => {
    const component = getWrapper()

    expect(component.text()).toBe('A child component')
    expect(component.find(ModalBackground)).toHaveLength(1)
  })

  it('Calls onClick on background click', () => {
    const component = getWrapper()
    component.find(ModalBackground).simulate('click')

    expect(component.props().onClick).toBeCalled()
  })
})
