import PropTypes from 'prop-types'
import React, { Component } from 'react'

export class NewButton extends Component {
  static propTypes = {
    model: PropTypes.string,
    onCreate: PropTypes.func
  }

  newItem = async () => {
    try {
      await this.props.onCreate()
    } catch (err) {
      console.log(err)
    }
  }

  render () {
    const { model } = this.props
    return (
      <nav className='AdminNav'>
        <div onClick={this.newItem}>
          <button>New {model}</button>
        </div>
      </nav>
    )
  }
}
