import { connect } from 'react-redux'
import { withRouter } from 'react-router'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import { logoutUser } from 'client/actions/user'

export class AdminNav extends React.Component {
  static propTypes = {
    logoutUserAction: PropTypes.func
  }

  render () {
    const { logoutUserAction } = this.props

    return (
      <AdminNavContainer>
        <a onClick={logoutUserAction}>
          Logout
        </a>
      </AdminNavContainer>
    )
  }
}

const mapStateToProps = state => ({
  isAuthenticated: state.user.isAuthenticated
})

const mapDispatchToProps = {
  logoutUserAction: logoutUser
}

export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(AdminNav)
)

const AdminNavContainer = styled.div`
  a {
    cursor: pointer;
  }
`
