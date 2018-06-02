import styled from 'styled-components'
import { connect } from 'react-redux'
import { capitalize } from 'underscore.string'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Waypoint from 'react-waypoint'

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
      <HeaderContainer
        className='Header'
        admin={isAuthenticated}
        fixed={isFixed}
      >
        <h1>
          <A href='/'>{title}</A>
        </h1>
        {hasMenuItems &&
          <nav>
            {nav.map((navItem, i) =>
              <A
                className='Header__nav-item'
                href={`/${navItem}`}
                key={i}
                active={this.isActive(navItem)}
              >
                {capitalize(navItem)}
              </A>
            )}
          </nav>
        }
      </HeaderContainer>
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

export const HeaderContainer = styled.div`
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  label {
    font-weight: 600;
  }
  h1 {
    font-size: 1.5em;
    font-weight: 600;
    line-height: 1em;
    text-transform: uppercase;
    letter-spacing: .075em;
  }
  ${props => props.admin && `
    justify-content: flex-start;
  `}
  ${props => props.fixed && `
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    background: white;
    z-index: 10;
    border-bottom: 1px solid #ddd;
  `}
  @media (max-width: 46rem) {
    display: block;
    ${props => props.fixed && `
      nav {
        margin: 15px 0 10px 0;
      }
    `}
  }
`

const A = styled.a`
  text-decoration: none;
  color: black;
  margin-right: 15px;
  &:hover {
    color: #ddd;
  }
  ${props => props.active && `
    border-bottom: 2px solid;
  `}
`
