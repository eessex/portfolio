import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { capitalize } from 'underscore.string'
import * as Actions from '../../actions/user'
require('./index.scss')

class Header extends Component {

  render() {
    const { title, nav } = this.props.settings.settings

    const hasMenuItems = nav && nav.length > 1

    return (
      <div className='Header' data-layout='centered'>
        <h1>
          <a href="/">{title}</a>
        </h1>
        <nav className='Header__nav'>
          {nav && nav.map((navItem, i) =>
            <a
              className='Header__nav-item'
              href={`/${navItem}`}
              key={i}
            >
              {capitalize(navItem)}
              {hasMenuItems && i !== (nav.length - 1) &&
                <span className='divider'>,</span>
              }
            </a>
          )}
        </nav>
      </div>
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
