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
    this.toggleNav = this.toggleNav.bind(this);
  }

  toggleNav() {
    this.setState({open: !this.state.open})
  }

  adminNav() {
    if (this.props.user.isAuthenticated) {
      return <AdminNav actions={this.props.actions} onClick={this.toggleNav} />
    } else {
      return <Link to="/login" onClick={this.toggleNav}>Log In</Link>
    }
  }

  nav() {
    if (this.state.open) {
      return (
        <div>
          <div style={styles.menu}>
            <Nav onClick={this.toggleNav} />
            {this.adminNav()}
          </div>
          <div style={styles.modal} onClick={this.toggleNav}></div>
        </div>
      )
    }
  }

  render() {
    return (
      <nav className='header' style={styles.header}>
        <h2 style={{margin: 0}}><Link to="/">Home</Link></h2>
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
    justifyContent: 'space-between',
    padding: '10px 20px'
  },
  headerRight: {
    minWidth: 30,
    minHeight: 30
  },
  menu: {
    position: 'fixed',
    right: 15,
    top: 5,
    border: '1px solid',
    padding: '5px 45px 10px 12px',
    background: 'white',
    zIndex: 1
  },
  modal: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0
  }
}