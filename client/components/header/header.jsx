import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Waypoint from 'react-waypoint'
import { connect } from 'react-redux'
import { capitalize } from 'underscore.string'

export class Header extends Component {
  static propTypes = {
    settings: PropTypes.object,
    user: PropTypes.object
  }

  state = {
    navOpen: false,
    scrollPosition: 0,
    scrollDir: null
  }

  componentDidMount = () => {
    this.setState({scrollPosition: window.pageYOffset})

    window.addEventListener('scroll', () => {
      this.onScroll()
    })
  }

  onScroll = () => {
    const { scrollPosition } = this.state
    const offset = window.pageYOffset
    let scrollDir = null

    if (offset !== scrollPosition) {
      if (offset < scrollPosition) {
        scrollDir = 'up'
      }
      this.setState({
        scrollPosition: offset,
        scrollDir
      })
    }
  }

  onWaypointEnter = () => {
    const { navOpen } = this.state

    if (navOpen) {
      this.setState({ navOpen: false })
    }
  }

  onWaypointLeave = () => {
    const { navOpen } = this.state
    if (!navOpen) {
      this.setState({ navOpen: true })
    }
  }

  isActive (navItem) {
    const { pathname } = window.location
    return (pathname).replace('/', '') === navItem || pathname === '/' && navItem === 'events'
  }

  headerInner = (isFixed) => {
    const { title, nav } = this.props.settings.settings
    const { isAuthenticated } = this.props.user
    const hasMenuItems = nav && nav.length > 0

    return (
      <div
        className='Header'
        data-layout={isAuthenticated ? 'admin' : ''}
        data-fixed={isFixed}
      >
        <h1>
          <a href='/'>{title}</a>
        </h1>

        <nav className='Header__nav'>
          {hasMenuItems && nav.map((navItem, i) =>
            <a
              className='Header__nav-item'
              href={`/${navItem}`}
              key={i}
              data-active={this.isActive(navItem)}
            >
              {capitalize(navItem)}
            </a>
          )}
        </nav>
      </div>
    )
  }

  render () {
    const { navOpen, scrollDir } = this.state

    return (
      <Waypoint
        onEnter={this.onWaypointEnter}
        onLeave={this.onWaypointLeave}
      >
        <div>
          {this.headerInner()}
          {navOpen && scrollDir === 'up' &&
            this.headerInner(true)
          }
        </div>
      </Waypoint>
    )
  }
}

const mapStateToProps = (state) => ({
  ...state
})

export default connect(
  mapStateToProps
)(Header)
