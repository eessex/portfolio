import React, { Component } from 'react'
import TextInput from '../../components/forms/text_input.js'

class NewUser extends Component {
  constructor(props) {
    super(props)

    this.onSubmit = this.onSubmit.bind(this)
  }

  componentWillUnmount() {
    if (!this.props.isAuthenticated) {
      this.props.actions.logoutUser()
    }
  }

  onSubmit(e) {
    if (this.refs.password.value == this.refs.password_confirm.value) {
      var creds = {
        email: this.refs.email.value,
        password: this.refs.password.value
      }
      this.props.actions.createUser(creds)
    } else {
      alert("Passwords do not match!")
    }
  }

  renderError() {
    if (this.props.error) {
      return <div>{this.props.error}</div>
    }
  }

  render() {
    return (
      <div className='user--login'>
        <h1>New User</h1>
        {this.renderError()}
        <form onSubmit={this.onSubmit}>
        <input
          ref='email'
          placeholder='email'
          required />
        <input
          ref='password'
          placeholder='password'
          type='password'
          required />
        <input
          ref='password_confirm'
          placeholder='confirm password'
          type='password'
          required />
        <button onClick={this.onSubmit}>Submit</button>
        </form>
      </div>
    )
  }
}
export default NewUser
