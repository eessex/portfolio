import React, { Component } from 'react'
import { Link } from 'react-router-dom'

export default class Nav extends Component {
  render() {
    return (
      <nav className='header--menu'>
        <h4><Link to="/events">Events</Link></h4>
        <h4><Link to="/projects">Projects</Link></h4>
        <h4><Link to="/about">About</Link></h4>
      </nav>
    )
  }
}
