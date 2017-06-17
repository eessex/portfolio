import React, { Component } from 'react';

class EventNav extends Component {
  constructor(props) {
    super(props);

    this.onPublish = this.onPublish.bind(this);
  }

  onPublish() {
    this.props.onChange('published', !this.props.event.published)
  }

  renderPublished(event) {
    if (!event.published) {
      return <button
          className='publish'
          onClick={this.onPublish}>
          Publish
        </button>
    } else {
      return <button
          className='unpublish'
          onClick={this.onPublish}>
          Unpublish
        </button>
    }
  }

  render() {
    const { needSave, isSaving, event } = this.props;
    var need = needSave ? ' attention' : ''
    var saving = isSaving ? ' saving' : ''
    var save = null
    if (needSave) {
      save = styles.attention
    } else if (isSaving) {
      save = styles.saving
    }

    return (
      <nav>
        <button
          className='delete'
          onClick={this.props.deleteEvent}>
          Delete
        </button>
        <button
          onClick={this.props.saveEvent}
          className={need + saving}
          style={save}>
          Save
        </button>
        {this.renderPublished(event)}
      </nav>
    );
  }
}

export default EventNav;

const styles = {
  attention: {
    color: 'red'
  },
  saving: {
    color: 'limegreen'
  },
}