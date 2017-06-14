import React, { Component } from 'react';

class EventNav extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { needSave, isSaving } = this.props;
    var need = needSave ? ' attention' : ''
    var saving = isSaving ? ' saving' : ''

    return (
      <nav>
        <button
          className='delete'
          onClick={this.props.deleteEvent}>
          Delete
        </button>
        <button
          onClick={this.props.saveEvent}
          className={need + saving}>
          Save
        </button>
      </nav>
    );
  }
}

export default EventNav;