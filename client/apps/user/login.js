import React, { Component } from 'react';
import TextInput from '../components/forms/text_input.js';

class Login extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    if (this.props.isAuthenticated) {
      window.location.replace('/')
    }
  }

  componentWillUnmount() {
    if (!this.props.isAuthenticated) {
      // this.props.actions.logoutUser()
    }
  }

  onSubmit(e) {
  	var creds = {
  		email: this.refs.email.value,
  		password: this.refs.password.value
  	}
  	this.props.actions.loginUser(creds)
    // console.log(signed);
  }

  renderError() {
    if (this.props.error) {
      return <div>{this.props.error}</div>
    }
  }

  render() {
    return (
      <div className='user--login'>
        <h1>Log In</h1>
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
        <button onClick={this.onSubmit}>Submit</button>
        </form>
      </div>
    );
  }
}
export default Login;
