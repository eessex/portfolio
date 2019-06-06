import React, { Component } from 'react'
import { connect } from 'react-redux'
import { loginUser } from 'client/actions/user'
import { Button } from 'client/components/Button'
import { ColumnForm, Input, ErrorContainer } from 'client/styles/forms'
import { LayoutColumn } from 'client/components/layout/column'
import { Loading } from 'client/components/Loading'
import { ErrorBoundary } from 'client/components/ErrorBoundary'
import { Error } from 'client/typings'

interface LoginProps {
  error: Error
  loading: boolean
  loginUserAction: (creds: any) => void
}

export class Login extends Component<LoginProps> {
  public email
  public password

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
                  ref={email => (this.email = email)}
                  placeholder='email'
                  required
                />
                <Input
                  ref={password => (this.password = password)}
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
