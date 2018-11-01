import { connect } from 'react-redux'
import { debounce } from 'lodash'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import Waypoint from 'react-waypoint'
import { NavLink } from 'react-router-dom'
import { resetItems } from 'client/actions/items2'
import { H1 } from 'client/styles/text.jsx'

const appTitle = process.env.PAGE_TITLE

const links = [
  {
    name: 'Events',
    param: 'events'
  },
  {
    name: 'Projects',
    param: 'projects'
  },
  {
    name: 'Releases',
    param: 'releases'
  }
]

export class Nav extends React.Component {
  static propTypes = {
    resetItemsAction: PropTypes.func,
    location: PropTypes.object
  }

  state = {
    navOpen: false,
    scrollPosition: 0,
    scrollDir: null
  }

  componentDidMount = () => {
    const debouncedOnScroll = debounce(
      this.onScroll,
      5
    )

    if (__isBrowser__) {
      const scrollPosition = window.pageYOffset

      this.setState({ scrollPosition })
      window.addEventListener('scroll', () => {
        debouncedOnScroll()
      })
    }
  }

  onScroll = () => {
    if (__isBrowser__) {
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
  }

  onClick = param => {
    const linkIsActive = this.linkIsActive(param)

    if (!linkIsActive) {
      this.props.resetItemsAction()
    }
  }

  linkIsActive = param => {
    const { location: { pathname } } = this.props
    // const isHome = path === '/'
    const isActive = (pathname).replace('/', '') === param

    return isActive // || isHome && param === 'events'
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

  render () {
    const { navOpen, scrollDir } = this.state

    return (
      <div>
        <NavContainer scrollDir={scrollDir} navOpen={navOpen}>
          <H1>
            <NavLink to={``}>
              {appTitle}
            </NavLink>
          </H1>

          <Navigation>
            {links.map(({ name, param }) => {
              const linkIsActive = this.linkIsActive(param)

              return (
                <NavItem linkIsActive={linkIsActive} key={param}>
                  <NavLink
                    to={`/${param}`}
                    onClick={() => this.onClick(param)}
                  >
                    {name}
                  </NavLink>
                </NavItem>
              )
            })}
          </Navigation>
        </NavContainer>
        <Waypoint
          onEnter={this.onWaypointEnter}
          onLeave={this.onWaypointLeave}
        />
      </div>
    )
  }
}

const mapStateToProps = state => ({})

const mapDispatchToProps = {
  resetItemsAction: resetItems
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Nav)
)

const NavContainer = styled.div`
  padding: 10px 20px;
  display: flex;
  align-items: center;
  justify-content: space-between;

  a {
    text-decoration: none;
  }

  ${H1} {
    font-size: 1.5em;
    font-weight: 600;
    line-height: 1em;
    text-transform: uppercase;
    letter-spacing: .075em;
  }

  ${props => props.navOpen && `
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    background: white;
    z-index: 10;
    border-bottom: 1px solid #ddd;
  `}
`

const Navigation = styled.div`
  list-style: none;
  display: flex;
  margin-block-start: 0;
  padding-inline-start: 0;
`

const NavItem = styled.div`
  padding-left: 15px;

  ${props => props.linkIsActive && `
    a {
      border-bottom: 2px solid;
      font-weight: 600;
    }
  `}
`
