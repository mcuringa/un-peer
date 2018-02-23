import React, { Component } from "react";
import { Button } from "react-bootstrap";
import _ from "lodash";
import {TextGroup} from '../FormUtil.js'
import FBUtil from "../FBUtil";
import UserDB from "./UserDB.js";

export default class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      nouser: false,
      reset: false,
      sent: false,
      user: props.user
    };

    this.reset = this.reset.bind(this);

  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      nouser: false,
      reset: false,
      sent: false,
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = event => {
    let loggedIn = false;

    console.log("logging in with google");

    let email = this.state.email.trim();
    let pw = this.state.password.trim();

    const firebase = FBUtil.init();

    let user = null;
    const merge = (u)=>{ 
      console.log("merging");
      console.log(u);
      user = _.merge(user, u);
      this.setState({user: user});
    };

    const add = (u)=>{
      const user = {
        created: new Date(),
        uid: u.uid,
        email: u.email,
        roles: ["user"],
        student: true,
        admin: false,
        su: false
      }
      UserDB.save(user).then(merge);
    };

    const success = (auth)=> {
      user = firebase.auth().currentUser;
      UserDB.get(user.uid).then(merge, add);
    };
    const err = (error)=> {
      let code = error.code;
      let msg = error.message;

      if(code === "auth/user-not-found")
        this.setState({nouser: true});
      else if(code === "auth/wrong-password")
        this.setState({reset: true});
    }

    firebase.auth().signInAndRetrieveDataWithEmailAndPassword(email, pw)
    .then(success, err);

    event.preventDefault();
  }

  reset(e) {
    e.preventDefault();
    const firebase = FBUtil.init();

    
    firebase.auth().sendPasswordResetEmail(this.state.email)
      .then(()=> {
        this.setState({sent: true});
        this.setState({reset: false});
      })
      .catch((error)=> {
        console.log(error);
      });
  }

  render() {
    return (
      <div className="Login screen">
        <img className="LoginLogo d-block" src="/img/unpc-logo.png" />

        <div className={`ResetSent alert alert-success${(this.state.sent)?"":" d-none"}`}>
          Please check your email for a link to reset your password.
        </div>  

        <div className={`UserNotFound alert alert-warning${(this.state.nouser)?"":" d-none"}`}>
          There is no user with email <tt>{this.state.email}</tt>
        </div>

        <div className={`ResetPassword alert alert-warning${(this.state.reset)?"":" d-none"}`}>
          Incorrect pasword. <a href="#reset-pass" onClick={this.reset} className="alert-link">Click here to send an email with instructions to reset.</a>
        </div>

        <form onSubmit={this.handleSubmit}>

          <TextGroup id="email"
            autoFocus
            label="Email"
            value={this.state.email}
            onChange={this.handleChange} 
            required={true} />

          <TextGroup id="password"
            autoFocus
            type="password"
            label="Password"
            value={this.state.password}
            onChange={this.handleChange} 
            required={true} />

          <Button
            block
            bsSize="large"
            type="submit"
          >
            Start
          </Button>
        </form>
      </div>
    );
  }

}

