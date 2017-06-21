import React, { Component } from 'react'

export default class ValidationError extends Component {
  constructor(props) {
    super(props)
  }

  getErrors() {
  	const fields = Object.keys(this.props.errors)
  	const errors = fields.map((error, i) => {
  		let getType = this.props.errors[error].message.split('`').pop()
  		let formatError = error.split('_').join(' ') + getType
  		return <span key={i}>{formatError}</span>
  	}, this)
  	return errors
  }

  render() {
    return (
      <div className='error'>
        <div>{this.getErrors()}</div>
      </div>
    );
  }
}