import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createUser, logoutUser } from 'client/actions/user'
import { Button } from 'client/components/Button'
import { ColumnForm, Input, ErrorContainer } from 'client/styles/forms'
import { LayoutColumn } from 'client/components/layout/column'
import { Loading } from 'client/components/Loading'

export class NewUser extends Component {
  static propTypes = {
    createUserAction: PropTypes.func,
    error: PropTypes.string,
    isAuthenticated: PropTypes.bool,
    loading: PropTypes.bool,
    logoutUserAction: PropTypes.func
  }

  static email
  static password
  static password_confirm

  componentDidMount () {
    if (!this.props.isAuthenticated) {
      window.location.replace('/')
    }
  }

  componentWillUnmount () {
    const { logoutUserAction, isAuthenticated } = this.props

    if (!isAuthenticated) {
      logoutUserAction()
    }
  }

  onSubmit = e => {
    const { createUserAction } = this.props

    if (this.password && this.password_confirm) {
      if (this.password.value !== undefined &&
        this.password.value === this.password_confirm.value) {
        const creds = {
          email: this.email.value,
          password: this.password.value
        }

        createUserAction(creds)
      } else {
        alert('Passwords do not match!')
      }
    }
  }

  render () {
    const { error, loading } = this.props

    return (
      <LayoutColumn label='New User'>
        {loading
          ? <Loading />
          : (
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
              <Input
                ref={password_confirm => (this.password_confirm = password_confirm)}
                placeholder='confirm password'
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

const mapStateToProps = ({ userReducer }) => ({
  error: userReducer.error,
  loading: userReducer.loading,
  isAuthenticated: userReducer.isAuthenticated
})

const mapDispatchToProps = {
  createUserAction: createUser,
  logoutUserAction: logoutUser
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(NewUser)
