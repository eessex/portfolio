import React, { Component } from 'react';

class UrlInput extends Component {
  constructor(props) {
    super(props);
    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
    e.preventDefault()
  	this.props.confirmLink(this.refs.url.value)
  }

  render() {
    return (
      <form
      	onSubmit={this.onSubmit}
      	className='input--url'>
        <input
          placeholder={name}
          ref='url'
          defaultValue={this.props.url || ''} />
        <button>Save</button>
      </form>
    );
  }
}

export default UrlInput;