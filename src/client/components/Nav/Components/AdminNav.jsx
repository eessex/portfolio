import { connect } from 'react-redux'
import PropTypes from 'prop-types'
import styled from 'styled-components'
import React from 'react'
import { logoutUser } from 'client/actions/user'
import { NewItemButton } from 'client/components/Nav/Components/NewItemButton/NewItemButton'

export class AdminNav extends React.Component {
  static propTypes = {
    logoutUserAction: PropTypes.func
  }

  render () {
    const { logoutUserAction } = this.props

    return (
      <AdminNavContainer>
        <NewItemButton />
        <a onClick={logoutUserAction}>
          Logout
        </a>
      </AdminNavContainer>
    )
  }
}

const mapDispatchToProps = {
  logoutUserAction: logoutUser
}

export default connect(
  () => ({}),
  mapDispatchToProps
)(AdminNav)

export const AdminNavContainer = styled.div`
  a {
    cursor: pointer;
    padding-left: 15px;
  }
`
