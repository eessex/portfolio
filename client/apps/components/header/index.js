import React, { Component } from 'react';
import { connect } from 'react-redux';
import {bindActionCreators} from 'redux';
import * as Actions from '../../../actions/user';
import { Link } from 'react-router-dom';
import Nav from './nav';
import AdminNav from './admin_nav';
import IconMenu from '../icons/icon_menu'

class Header extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false
    }
    this.logOut = this.logOut.bind(this);
    this.toggleNav = this.toggleNav.bind(this);
  }

  logOut() {
    this.props.actions.logoutUser()
  }

  toggleNav() {
    this.setState({open: !this.state.open})
  }

  adminNav() {
    if (this.props.user.isAuthenticated) {
      return <AdminNav actions={this.props.actions} />
    }
  }

  nav() {
    if (this.state.open) {
      return (
        <div style={styles.menu}>
          <Nav />
          {this.adminNav()}
        </div>
      )
    }
  }

  render() {
    return (
      <nav className='header' style={styles.header}>
        <Link to="/">Home</Link>
        <div className='header--right' style={styles.headerRight}>
          <IconMenu onClick={this.toggleNav} open={this.state.open}/>
          {this.nav()}
        </div>
      </nav>
    );
  }
}

const mapStateToProps = (state) => ({
  ...state
});

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header);

const styles = {
  header: {
    display: 'flex',
    justifyContent: 'space-between'
  },
  headerRight: {
    minWidth: 30,
    minHeight: 30
  },
  menu: {
    position: 'fixed',
    right: 5,
    border: '1px solid',
    padding: '5px 45px 10px 12px',
    top: 5
  }
}