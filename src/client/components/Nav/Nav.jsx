import { capitalize } from 'underscore.string'
import { connect } from 'react-redux'
import { debounce } from 'lodash'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import { Waypoint } from 'react-waypoint'
import { resetItem } from 'client/actions/item'
import { resetItems } from 'client/actions/items'
import AdminNav, { AdminNavContainer } from './Components/AdminNav'
import { H1 } from 'client/styles/text'

const { PAGE_TITLE } = process.env

const links = [
  'events',
  'releases',
  'projects',
  'info'
]

export class Nav extends React.Component {
  static propTypes = {
    isAuthenticated: PropTypes.bool,
    resetItemAction: PropTypes.func,
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
    if (param === "info") {
      this.props.resetItemAction()
    }
    if (!linkIsActive) {
      this.props.resetItemsAction()
    }
  }

  linkIsActive = param => {
    const { location: { pathname } } = this.props
    const isActive = (pathname).replace('/', '') === param

    return isActive
  }

  hasAdminNav = () => {
    const { location: { pathname } } = this.props
    const isHome = pathname === '/'
    const isItemsLink = links.includes((pathname).replace('/', ''))

    return (isItemsLink || isHome) && pathname !== '/info'
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
    const { isAuthenticated } = this.props
    const showAdminNav = isAuthenticated && this.hasAdminNav()

    return (
      <div>
        <NavContainer scrollDir={scrollDir} navOpen={navOpen}>
          <H1>
            <a href='/'>
              {PAGE_TITLE}
            </a>
          </H1>

          <NavItems isAuthenticated={isAuthenticated}>
            <MainMenu>
              {links.map(param => {
                const linkIsActive = this.linkIsActive(param)

                return (
                  <NavItem linkIsActive={linkIsActive} key={param}>
                    <a
                      href={`/${param}`}
                      onClick={() => this.onClick(param)}
                    >
                      {capitalize(param)}
                    </a>
                  </NavItem>
                )
              })}
            </MainMenu>

            {showAdminNav &&
              <AdminNav />
            }
          </NavItems>
        </NavContainer>
        <Waypoint
          onEnter={this.onWaypointEnter}
          onLeave={this.onWaypointLeave}
        />
      </div>
    )
  }
}

const mapStateToProps = ({ userReducer }) => ({
  isAuthenticated: userReducer.isAuthenticated
})

const mapDispatchToProps = {
  resetItemAction: resetItem,
  resetItemsAction: resetItems
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(Nav)
)

export const NavContainer = styled.div`
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
    padding-right: 15px;
  }

  ${props => props.navOpen && `
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    background: white;
    z-index: 10;
    border-bottom: 1px solid black;
  `}

  @media (max-width: 46rem) {
    align-items: flex-start;
    justify-content: flex-start;
    flex-direction: column;

    ${AdminNavContainer} {
      display: none;
    }
  }
`

const MainMenu = styled.div`
  list-style: none;
  display: flex;
  margin-block-start: 0;
  padding-inline-start: 0;
`

const NavItems = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  ${props => props.isAuthenticated && `
    flex: 1;
  `}
`

const NavItem = styled.div`
  padding-right: 15px;
  &:last-child {
    padding-right: 0;
  }

  ${props => props.linkIsActive && `
    a {
      border-bottom: 2px solid;
      font-weight: 600;
    }
  `}
`
