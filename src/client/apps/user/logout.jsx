import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { logoutUser } from 'client/actions/user'
import { LayoutColumn } from 'client/components/layout/column'
import { Loading } from 'client/components/Loading'

export class Login extends Component {
  static propTypes = {
    loading: PropTypes.bool,
    logoutUserAction: PropTypes.func
  }

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
)(Login)
