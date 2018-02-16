import React, { Component } from "react";
import { Button, FormGroup, FormControl, ControlLabel } from "react-bootstrap";
import "./Login.css";
import FBUtil from "../FBUtil";


export default class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      user: props.user
    };
  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    let loggedIn = false;

    console.log("logging in with google");

    let email = this.state.email.trim();
    let pw = this.state.password.trim();

    const firebase = FBUtil.init();
    console.log("got firebase");
    firebase.auth().signInWithEmailAndPassword(email, pw).catch(function(error) {
      let code = error.code;
      let msg = error.message;

      //@todo: handle these codes
      // auth/user-not-found
      // auth/wrong-password
      console.log(code);
    });
    let user = firebase.auth().currentUser;
    console.log(user.email);

    event.preventDefault();
  }

  render() {
    return (
      <div className="Login">
        <form onSubmit={this.handleSubmit}>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl
              autoFocus
              type="email"
              value={this.state.email}
              onChange={this.handleChange}
            />
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl
              value={this.state.password}
              onChange={this.handleChange}
              type="password"
            />
          </FormGroup>
          <Button
            block
            bsSize="large"
            type="submit"
          >
            Login
          </Button>
        </form>
      </div>
    );
  }

}

