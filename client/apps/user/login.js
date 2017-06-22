import React, { Component } from 'react';
import TextInput from '../components/forms/text_input.js';

class Login extends Component {
  constructor(props) {
    super(props);

    this.onSubmit = this.onSubmit.bind(this);
  }

  onSubmit(e) {
  	var creds = {
  		email: this.refs.email.value,
  		password: this.refs.password.value
  	}
  	this.props.actions.loginUser(creds)
  }

  render() {
    return (
      <div className='user--login'>
        <h1>Log In</h1>
        <form onSubmit={this.onSubmit}>
        <input
          ref='email'
          placeholder='email'
          required />
        <input
          ref='password'
          placeholder='password'
          required />
        <button onClick={this.onSubmit}>Submit</button>
        </form>
      </div>
    );
  }
}
export default Login;
