import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class Nav extends Component {
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <nav className='header--menu'>
        <h4><Link to="/events" onClick={this.props.onClick}>Events</Link></h4>
        <h4><Link to="/about" onClick={this.props.onClick}>About</Link></h4>
      </nav>
    )
  }
}
