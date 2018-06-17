import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class ValidationError extends Component {
  static propTypes = {
    errors: PropTypes.object
  }

  getErrors = () => {
    const { errors } = this.props
    const fields = Object.keys(errors)

    return fields.map((error, i) => {
      const type = errors[error].message.split('`').pop()
      const message = error.split('_').join(' ')

      return <span key={i}>{message + type}</span>
    })
  }

  render () {
    return (
      <div>
        {this.getErrors()}
      </div>
    )
  }
}
