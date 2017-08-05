import React from 'react'
import { mount } from 'enzyme'
import EventEdit from '../../../../apps/event/components/edit'
import { Link } from 'react-router-dom';

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

  // const { enzymeWrapper, props } = setup()

  // it('renders the event nav and form', () => {
  //   expect(enzymeWrapper.find('button').length).toBe(3)
  //   expect(enzymeWrapper.find('input').length).toBe(4)
  // })

  // it('renders the title input', () => {
  //   const TextInput = enzymeWrapper.find('TextInput')
  //   expect(TextInput.nodes[0].props.name).toBe('title')
  //   expect(TextInput.nodes[0].props.value).toBe('Event')
  // })

  // it('renders the start_date input', () => {
  //   const DateInput = enzymeWrapper.find('DateInput')
  //   expect(DateInput.nodes[0].props.name).toBe('start_date')
  // })

  // it('renders the all_day input', () => {
  //   const CheckboxInput = enzymeWrapper.find('CheckboxInput')
  //   expect(CheckboxInput.nodes[0].props.name).toBe('all_day')
  // })

});
