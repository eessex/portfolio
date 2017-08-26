import React, { Component } from 'react';

export default class EventVenue extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { venue } = this.props
    return (
      <div className='event-venue' onClick={this.props.onClick}>
        {venue && <h4>{venue.name}</h4>}
        {venue && <h4>{venue.address}</h4>}
        {venue &&
          <h4>
            {venue.city}
            {venue.state && venue.city ? ', ' + venue.state : venue.state}
            {(venue.state || venue.city) && venue.country ? ' ' + venue.country : venue.country}
          </h4>
        }
      </div>
    );
  }
}