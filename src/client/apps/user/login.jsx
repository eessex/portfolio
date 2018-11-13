import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loginUser } from 'client/actions/user'
import { Button } from 'client/components/Button'
import { ColumnForm, Input, ErrorContainer } from 'client/styles/forms'
import { LayoutColumn } from 'client/components/layout/column'
import { Loading } from 'client/components/Loading'
import { ErrorBoundary } from 'client/components/ErrorBoundary'

export class Login extends Component {
  static propTypes = {
    error: PropTypes.string,
    loading: PropTypes.bool,
    loginUserAction: PropTypes.func
  }

  static email
  static password

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
            <ErrorBoundary>
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
            </ErrorBoundary>
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
  loginUserAction: loginUser
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(Login)
