import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { Button } from '../../forms/buttons/button.jsx'
import { Nav } from 'client/components/Nav/ItemAdminNav'

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
      <Nav>
        <Button
          text={`New ${model}`}
          onClick={this.newItem}
        />
      </Nav>
    )
  }
}
