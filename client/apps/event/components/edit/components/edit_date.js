import React, { Component } from 'react';
import CheckboxInput from '../../../../components/forms/checkbox_input.js';
import DateInput from '../../../../components/forms/date_input.js';

export default class EditDate extends Component {
  constructor(props) {
    super(props);
  }

  renderEndDate(event) {
    if (event.end_date || !this.props.hasEndDate) {
      return (
        <div className='end-date'>
          <DateInput
            name='end_date'
            label
            value={event.end_date || null}
            allDay={event.all_day || false}
            onChange={this.props.onChange} />
        </div>
      )
    }
  }

  render() {
    const { event, hasEndDate } = this.props
    const actionFlex = event.published ? 'space-between' : 'flex-end'
    return (
      <div className='edit-date'>
        <DateInput
          name='start_date'
          label
          value={event.start_date || new Date}
          required={true}
          allDay={event.all_day || false}
          onChange={this.props.onChange} />
        {this.renderEndDate(event)}
        <div className='actions' style={{justifyContent: actionFlex}}>
          <div className='actions--toggle'>
            <CheckboxInput
              label='Hide End Date'
              name='end_date'
              value={hasEndDate}
              onChange={this.props.toggleEndDate} />
            <CheckboxInput
              label='Hide Time'
              name='all_day'
              value={event.all_day || false}
              onChange={this.props.onChange} />
            </div>
        </div>
      </div>
    )
  }
}