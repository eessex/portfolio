import { connect } from 'react-redux'
import styled from 'styled-components'
import React from 'react'
import { logoutUser } from 'client/actions/user'
import { NewItemButton } from 'client/components/Nav/Components/NewItemButton/NewItemButton'

interface AdminNavProps {
  logoutUserAction: () => void
}

export class AdminNav extends React.Component<AdminNavProps> {
  render () {
    return (
      <AdminNavContainer>
        <NewItemButton />
        <a onClick={this.props.logoutUserAction}>
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
  state => state,
  mapDispatchToProps
)(AdminNav)

export const AdminNavContainer = styled.div`
  a {
    cursor: pointer;
    padding-left: 15px;
  }
`
