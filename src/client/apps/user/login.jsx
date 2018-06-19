import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loginUser } from 'client/actions/user'
import { Button } from 'client/components/forms/buttons/button'
import { ColumnForm, Input } from 'client/styles/forms'
import { LayoutColumn } from 'client/components/layout/column'
import { Loading } from 'client/components/layout/components/loading'

export class Login extends Component {
  static propTypes = {
    error: PropTypes.string,
    loading: PropTypes.bool,
    loginUserAction: PropTypes.func,
    isAuthenticated: PropTypes.bool
  }

  componentDidMount () {
    if (this.props.isAuthenticated) {
      window.location.replace('/')
    }
  }

  onSubmit = () => {
    const { loginUserAction } = this.props

    var creds = {
      email: this.refs.email.value,
      password: this.refs.password.value
    }
    loginUserAction(creds)
  }

  render () {
    const { error, loading } = this.props

    return (
      <LayoutColumn label='Log In'>
        {loading
          ? <Loading />
          : (
            <ColumnForm onSubmit={this.onSubmit}>
              <Input
                ref='email'
                placeholder='email'
                required
              />
              <Input
                ref='password'
                placeholder='password'
                type='password'
                required
              />

              {error && <div>{error}</div>}

              <Button onClick={this.onSubmit}>
                Submit
              </Button>
            </ColumnForm>
          )
        }
      </LayoutColumn>
    )
  }
}

const mapStateToProps = (state) => ({
  error: state.user.error,
  loading: state.user.loading,
  isAuthenticated: state.user.isAuthenticated
})

const mapDispatchToProps = {
  loginUserAction: loginUser
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
