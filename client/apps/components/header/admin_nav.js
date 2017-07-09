import React, { Component } from 'react';
import { Link } from 'react-router-dom';

export default class AdminNav extends Component {
  constructor(props) {
    super(props);
    this.logOut = this.logOut.bind(this);
  }

  logOut() {
    this.props.onClick()
    this.props.actions.logoutUser()
    window.location.replace('/')
  }

  render() {
    return (
      <nav className='header--menu' style={styles.menu}>
        <Link to="/" onClick={this.logOut}>Log Out</Link>
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