import React, { Component } from 'react';
const moment = require('moment');

export default class EventDate extends Component {
  constructor(props) {
    super(props);
  }

  endDateFormat(event) {
    if (event.end_date) {
      if ((moment(event.start_date).format('MMM DD, YYYY') == moment(event.end_date).format('MMM DD, YYYY')) || event.all_day) {
        return (
          <span>{moment(event.end_date).format(' - MMM DD, YYYY')}</span>
        )
      } else {
        return (
          <span>{moment(event.end_date).format(' - MMM DD, YYYY, h:mma')}</span>
        )
      }
    }
  }

  startDateFormat(event) {
    if (event.end_date) {
      if ((moment(event.start_date).format('MMM DD, YYYY') == moment(event.end_date).format('MMM DD, YYYY')) || event.all_day) {
        return (
          <span>{moment(event.start_date).format('MMM DD')}</span>
        )
      } else {
        return (
          <span>{moment(event.start_date).format('MMM DD, YYYY, h:mma')}</span>
        )
      }
    } else if (event.all_day) {
      return (
        <span>{moment(event.start_date).format('MMM DD, YYYY')}</span>
      )
    } else {
      return (
        <span>{moment(event.start_date).format('MMM DD, YYYY, h:mma')}</span>
      )
    }
  }

  render() {
    const { event } = this.props;
    return (
      <h4>
        {this.startDateFormat(event)}
        {this.endDateFormat(event)}
      </h4>
    );
  }
}
