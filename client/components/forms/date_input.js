import React, { Component } from 'react';
const moment = require('moment');

class DateInput extends Component {
  constructor(props) {
    super(props);

    this.onKeyUp = this.onKeyUp.bind(this);
  }

  onKeyUp(e) {
    var date = this.refs.date.value
    var time = this.refs.time ? this.refs.time.value : ''
    var newDate = moment(date + ' ' + time).toISOString()
    this.props.onChange(this.props.name, newDate)
  }

  renderLabel(label) {
    if (label && label.length > 0) {
      return <label>{label}</label>
    } else if (label) {
      return <label>{this.props.name}</label>
    }
  }

  renderTime(value) {
    if (!this.props.allDay) {
      return (
        <input
          type='time'
          ref='time'
          defaultValue={moment(value).format('HH:mm')}
          onKeyUp={this.onKeyUp} />
      )
    }
  }

  render() {
    const { name, value, required, label } = this.props

    var group = label ? ' input-group' : ''
    var req = required ? ' req' : ''

    return (
      <div className={'input--date' + req + group}>
        {this.renderLabel(label)}
        <input
          type='date'
          ref='date'
          required={required || false}
          defaultValue={moment(value).format('YYYY-MM-DD')}
          onKeyUp={this.onKeyUp} />
          {this.renderTime(value)}
      </div>
    );
  }
}

export default DateInput;