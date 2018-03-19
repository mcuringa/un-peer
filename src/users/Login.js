import React, { Component } from "react";
import _ from "lodash";
import {NewTextInput, TextInput} from '../FormUtil.js'
import FBUtil from "../FBUtil";
import Modal from "../Modal";
import LoadingModal from "../LoadingModal";
import db from "../DBTools";


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

  handleSubmit = (e) => {

    e.preventDefault();
    e.stopPropagation();

    let form = document.getElementById("LoginForm");
    let valid = form.checkValidity();
    console.log(valid);
    if(!valid)
      return;


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

    const success = (auth)=> {

      console.log("successful sign in...");
      user = firebase.auth().currentUser;
      console.log("got user: ")
      console.log(user);
      this.setState({loading: false, loadingStatus: null});
      db.get("/users", user.uid).then(merge);
    }

    const err = (error)=> {
      console.log(error);
      this.setState({
        loading: false,
        loadingStatus: null,
        loginErr: error.code

      });
    }

    firebase.auth().signInAndRetrieveDataWithEmailAndPassword(email, pw)
    .then(success, err);

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

    const code = this.state.loginErr;
    const emailInvalid = code && code.length > 0;
    const invalidCss = (emailInvalid)?"is-invalid":"";
    let emailErr;
      if(code === "auth/user-not-found")
        emailErr = `There is no user with email ${this.state.email}.`;
      else if(code === "auth/wrong-password") {
        emailErr = (
          <div>
            You could not be logged in with that email/password
            combination. <button type="button"
              onCLick={this.reset}
              className="btn btn-link">Click here</button> to reset 
              your password.
          </div>
          );
      }
      else if(code === "auth/too-many-requests") {
        emailErr = "Your account has been temporarily blocked due becaue of too many failed login attempts. Try again later."
      }
      else if(emailInvalid) {
        emailErr = (
          <div>Could not log you in because of error code <tt>{code}</tt>.</div>
        )
      }




    return (
      <div className="Login screen">
        <LoadingModal id="LoadingModal" show={this.state.loading}
          status={this.state.loadingStatus} />
        
        <img className="LoginLogo d-block"
             alt="UN Peer Challenges logo"
             src="/img/unpc-logo.png" />

        <Modal id="ResetModal"
          title="Email Sent"
          show={this.state.sent}
          closeHandler={this.handleModalClose}
          body="Please check your email for a link to reset your password."
        />
        <Modal id="ForgotPassModal"
          show={this.state.forgotPass}
          closeHandler={this.handleModalClose}
          body="Send an email to reset your password?"
          onConfirm={this.reset} />

        <form id="LoginForm" className="LoginForm" onSubmit={this.handleSubmit}>
            <div className={`row`}>
                <label htmlFor="email"
                       className="col-3 col-form-label">
                    Email
                </label>
                <div className="col-9">
                    <TextInput
                      type="email"
                      validationCss={invalidCss}
                      id="email"
                      className=""
                      required={true}
                      autoFocus
                      type="email"
                      value={this.state.email}
                      onChange={this.handleChange} />
                </div>
                <div className="col-12 invalid-feedback">{emailErr}</div>
            </div>

            <div className="row">
                <label htmlFor="password"
                       className="col-3 col-form-label">
                    Password
                </label>
                <div className="col-9">
                    <TextInput
                        id="password"
                        className=""
                        required={true}
                        type="password"
                        value={this.state.password}
                        onChange={this.handleChange} />
                </div>
          </div>

          <div className="text-right">
            <button className="btn btn-link text-light"
              onClick={()=>{this.setState({forgotPass: true})}}
              type="button">Forgot password?</button>
          </div>

          <button
            className="StartButton btn btn-light btn-block"
            type="submit">
            Start
          </button>
        </form>
      </div>
    );
  }

}

const LoadingButton = (props) => {

  const LoadingSpinner = null;

  return (
    <button
      className="StartButton btn btn-light btn-block"
      type="submit">
      <div className="position-absolute" style={{width:"16px"}}>
        {LoadingSpinner}
      </div>
      {props.children}
    </button>
  )
}