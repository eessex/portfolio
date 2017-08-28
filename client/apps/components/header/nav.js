import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class Nav extends Component {
  constructor(props) {
    super(props);
  }

  render() {
    return (
      <nav className='header--menu' style={styles.menu}>
        <Link to="/events" onClick={this.props.onClick}>Events</Link>
        <Link to="/about" onClick={this.props.onClick}>About</Link>
      </nav>
    );
  }
}

const styles = {
  menu: {
    display: 'flex',
    flexDirection: 'column'
  }
}