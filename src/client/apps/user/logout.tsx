import React, { Component } from 'react'
import { connect } from 'react-redux'
import { logoutUser } from 'client/actions/user'
import { LayoutColumn } from 'client/components/layout/column'
import { Loading } from 'client/components/Loading'

interface LogoutProps {
  loading: boolean
  logoutUserAction: () => void
}

export class Logout extends Component<LogoutProps> {
  componentDidMount () {
    this.props.logoutUserAction()
  }

  render () {
    const { loading } = this.props

    return (
      <LayoutColumn label='Log Out'>
        {loading
          ? <Loading />
          : (
            <div>
              Bye
            </div>
          )
        }
      </LayoutColumn>
    )
  }
}

const mapStateToProps = ({ userReducer }) => ({
  error: userReducer.error,
  loading: userReducer.loading
})

const mapDispatchToProps = {
  logoutUserAction: logoutUser
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Logout)
