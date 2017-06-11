import React from 'react'
import { mount } from 'enzyme'
import EventEdit from '../../../../apps/event/components/edit'

function setup() {
  const props = {
    event: {id: '123', title: 'Event'},
    actions: {
      deleteEvent: jest.fn(),
      updateEvent: jest.fn(),
      createEvent: jest.fn()
    }
  }

  const enzymeWrapper = mount(<EventEdit {...props} />)

  return {
    props,
    enzymeWrapper
  }
};

describe('EventEdit', () => {

  const { enzymeWrapper, props } = setup()

  it('renders the event nav and form', () => {
    expect(enzymeWrapper.find('button').length).toBe(2)
    expect(enzymeWrapper.find('input').length).toBe(2)
  })

  it('renders the title input', () => {
    const TextInput = enzymeWrapper.find('TextInput')
    expect(TextInput.nodes[0].props.name).toBe('title')
    expect(TextInput.nodes[0].props.value).toBe('Event')
  })

  it('renders the venue input', () => {
    const TextInput = enzymeWrapper.find('TextInput')
    expect(TextInput.nodes[1].props.name).toBe('venue')
  })

});
