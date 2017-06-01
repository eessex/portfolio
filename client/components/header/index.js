import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Header extends Component {
  render() {
    return (
      <nav className='header'>
        <Link to="/">Home</Link>
        <Link to="/events">Events</Link>
        <Link to="/pages">Pages</Link>
      </nav>
    );
  }
}