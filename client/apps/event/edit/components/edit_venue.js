import React, { Component } from 'react'
import { SelectInput } from '../../../../components/forms/select_input.js'
import TextInput from '../../../../components/forms/text_input.js'

export default class EditVenue extends Component {
  constructor(props) {
    super(props)
  }
  render() {
    const { event } = this.props
    return (
      <div className='edit-venue'>
        <TextInput
          name='venue-name'
          value={event.venue ? event.venue.name : ''}
          onChange={this.props.onChangeVenue} />
        <TextInput
          name='venue-address'
          placeholder='Address'
          value={event.venue ? event.venue.address : ''}
          onChange={this.props.onChangeVenue} />
        <div className='field-group'>
          <TextInput
            name='venue-city'
            placeholder='City'
            value={event.venue ? event.venue.city : ''}
            onChange={this.props.onChangeVenue} />
          <SelectInput
            name='venue-state'
            value={event.venue ? event.venue.state : 0}
            states
            onChange={this.props.onChangeVenue} />
          <TextInput
            name='venue-country'
            placeholder='Country'
            value={event.venue ? event.venue.country : ''}
            onChange={this.props.onChangeVenue} />
        </div>
      </div>
    )
  }
}