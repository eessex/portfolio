import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loginUser } from 'client/actions/user'
import { Button } from 'client/components/forms/buttons/button'
import { ColumnForm, Input, ErrorContainer } from 'client/styles/forms'
import { LayoutColumn } from 'client/components/layout/column'
import { Loading } from 'client/components/layout/components/loading'

export class Login extends Component {
  static propTypes = {
    error: PropTypes.string,
    loading: PropTypes.bool,
    loginUserAction: PropTypes.func,
    isAuthenticated: PropTypes.bool
  }

  static email
  static password

  componentDidMount () {
    if (this.props.isAuthenticated) {
      window.location.replace('/')
    }
  }

  onSubmit = () => {
    const { loginUserAction } = this.props
    if (this.email && this.password) {
      const creds = {
        email: this.email.value,
        password: this.password.value
      }
      loginUserAction(creds)
    }
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
                innerRef={email => (this.email = email)}
                placeholder='email'
                required
              />
              <Input
                innerRef={password => (this.password = password)}
                placeholder='password'
                type='password'
                required
              />

              {error && <ErrorContainer>{error}</ErrorContainer>}

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

const mapStateToProps = state => ({
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
