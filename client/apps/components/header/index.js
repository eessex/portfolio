import React, { Component } from 'react'
import FontAwesome from 'react-fontawesome'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Actions from '../../../actions/user'
import { Link } from 'react-router-dom'
import Nav from './nav'
import AdminNav from './admin_nav'
import IconMenu from '../icons/icon_menu'
require('./index.scss')

class Header extends Component {
  constructor(props) {
    super(props)

    this.state = {
      open: false
    }
  }

  toggleNav = () => {
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
          <div className='header__menu'>
            <Nav onClick={this.toggleNav} />
            {this.adminNav()}
          </div>
          <div className='header__modal' onClick={this.toggleNav}></div>
        </div>
      )
    }
  }

  render() {
    const { settings } = this.props.settings
    const pageTitle = settings.title || "Home"
    return (
      <nav className='header'>
        <h2><Link to="/">{pageTitle}</Link></h2>
        <div className='header__right'>
          <IconMenu onClick={this.toggleNav} open={this.state.open}/>
          {this.nav()}
        </div>
      </nav>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(Actions, dispatch)
})

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Header)
