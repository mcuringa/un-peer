import React, { Component } from "react";
import { Button } from "react-bootstrap";
import _ from "lodash";
import {TextInput} from '../FormUtil.js'
import FBUtil from "../FBUtil";
import UserDB from "./UserDB.js";
import Modal from "../Modal";
import LoadingModal from "../LoadingModal";


export default class Login extends Component {

  constructor(props) {
    super(props);

    this.state = {
      email: "",
      password: "",
      nouser: false,
      reset: false,
      sent: false,
      loading: false,
      loadingStatus: null
    };

    this.reset = this.reset.bind(this);
    this.handleModalClose = this.handleModalClose.bind(this);

  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleModalClose() {
    this.setState({
      nouser: false,
      reset: false,
      sent: false,
      loading: false,
      loadingStatus: null
    });
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

    this.setState({loading: true, loadingStatus: "Authenticating..."});

    let email = this.state.email.trim();
    let pw = this.state.password.trim();

    const firebase = FBUtil.init();

    let user = null;
    const merge = (u)=>{ 
      console.log("merging");
      console.log(u);
      return _.merge(user, u);
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
      // UserDB.save(user).then(merge);
    };

    const success = (auth)=> {
      user = firebase.auth().currentUser;
      this.setState({loading: false, loadingStatus: null});

      // UserDB.get(user.uid).then(add);
    }

    const err = (error)=> {
      let code = error.code;
      let msg = error.message;
      this.setState({loading: false, loadingStatus: null});

      if(code === "auth/user-not-found")
        this.setState({nouser: true});
      else if(code === "auth/wrong-password")
        this.setState({reset: true});
    }

    firebase.auth().signInAndRetrieveDataWithEmailAndPassword(email, pw)
    .then(success, err);

    event.preventDefault();
  }

  reset() {
    const firebase = FBUtil.init();
    this.setState({forgotPass: false});
    
    firebase.auth().sendPasswordResetEmail(this.state.email)
      .then(()=> {
        this.setState({sent: true, reset: false});
      })
      .catch((error)=> {
        console.log(error);
      });
  }

  render() {
    return (
      <div className="Login screen">
        <LoadingModal id="LoadingModal" show={this.state.loading}
          status={this.state.loadingStatus} /> 
        <img className="LoginLogo d-block" src="/img/unpc-logo.png" />

        <Modal id="ResetModal" 
          show={this.state.sent}
          closeHandler={this.handleModalClose}
          body="Please check your email for a link to reset your password."
        />          
        <Modal id="ForgotPassModal"
          show={this.state.forgotPass} 
          closeHandler={this.handleModalClose}
          body="Send an email to reset your password?"
          onConfirm={this.reset} />

        <Modal id="WrongPassModal"
          show={this.state.reset} 
          closeHandler={this.handleModalClose}
          body="Incorrect password. Send an email to reset your password?"
          onConfirm={this.reset} />

        <Modal id="NoUserModal"
          show={this.state.nouser} 
          closeHandler={this.handleModalClose}
          body={`There is no user with email ${this.state.email}.`}
          />

        <form className="LoginForm" onSubmit={this.handleSubmit}>
          <div class="row">
            <div className="label col-sm-4"><label for="email">email</label></div>
            <div className="col">
              <TextInput id="email" className=""
                autoFocus
                value={this.state.email}
                onChange={this.handleChange} />
              </div>
          </div>

          <div class="row">
            <div className="label col-sm-4"><label for="password">password</label></div>
            <div className="col">
              <TextInput id="password" className=""
                autoFocus
                type="password"
                value={this.state.password}
                onChange={this.handleChange} />
            </div>
          </div>

          <div class="text-right">
            <button className="btn btn-link text-light"
              onClick={()=>{this.setState({forgotPass: true})}}
              type="button">Forgot password?</button>
          </div>

          <button type="button"
            className="StartButton btn btn-secondary"
            type="submit">
            Start
          </button>
        </form>
      </div>
    );
  }

}

