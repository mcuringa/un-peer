import React, { Component } from "react";
import {TextInput} from '../FormUtil.js'
import FBUtil from "../FBUtil";
import Modal from "../Modal";

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
    this.AuthError = this.AuthError.bind(this);
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
      loadingStatus: null,
      isValidated: false
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
    this.setState({isValidated: true});

    if(!valid) {
      //figure out why
      let email = document.getElementById("email");
      let password = document.getElementById("password");
      let emailErr = "";
      let passErr = "";
      if(email.validity.typeMismatch)
        emailErr = "Enter a valid email";
      else if(email.validity.valueMissing)
        emailErr = "You must enter an email address";

      if(password.validity.valueMissing)
        passErr = "Please enter your password.";

      this.setState({emailErr: emailErr, passErr: passErr});

      return;
    }


    this.setState({loading: true, loadingStatus: "Authenticating..."});
    

    let email = this.state.email.trim();
    let pw = this.state.password;

    const firebase = FBUtil.getFB();

    const success = (auth)=> {
      this.setState({loading: false, loadingStatus: false});
    }

    const err = (error)=> {
      console.log(error);
      this.setState({
        loading: false,
        loadingStatus: null,
        loginErr: error.code

      });
    }

    firebase.auth().signInWithEmailAndPassword(email, pw)
    .then(success, err);

  }

  reset() {
    const firebase = FBUtil.getFB();
    this.setState({forgotPass: false});

    firebase.auth().sendPasswordResetEmail(this.state.email)
      .then(()=> {
        this.setState({sent: true, reset: false});
      })
      .catch((error)=> {
        console.log(error);
      });
  }

  AuthError() {
    const code = this.state.loginErr;
    const emailInvalid = code && code.length > 0;
    let emailErr;

    if(!emailInvalid)
      return null;

    if(code === "auth/user-not-found") {
      emailErr = `There is no user with email ${this.state.email}.`;
    }
    else if(code === "auth/wrong-password") {
      emailErr = (
        <div>
          The password you entered is incorrect.<br/>
          <button type="button" onClick={this.reset}
            className="btn btn-link">Click here to reset 
            your password.</button>
        </div>
        );
    }
    else if(code === "auth/too-many-requests") {
      emailErr = "Your account has been temporarily blocked due because of too many failed login attempts. Try again later."
    }
    else if(emailInvalid) {
      emailErr = (
        <div>Could not log you in because of error code <tt>{code}</tt>.</div>
      )
    }

    return (
      <div className="alert alert-secondary alert-dismissible fade show" role="alert">
        {emailErr}
      </div>
    )
  }


  render() {

    // const code = this.state.loginErr;
    // const emailInvalid = code && code.length > 0;
    const emailInvalidCss = (this.state.emailErr && this.state.emailErr.length > 0)?"is-invalid":"";
    const passInvalidCss = (this.state.passErr && this.state.passErr.length > 0)?"is-invalid":"";


    let validationClass = (this.state.isValidated)?"was-validated":"needs-validation";

    return (
      <div className="Login screen">
        
        <img className="LoginLogo d-block"
             alt="UN Peer Challenges logo"
             src="/img/UNSSC_logo.png" />

        <h5 className="text-white text-center font-weight-bold mb-3" style={{fontVariant: "small-caps"}}>UN Peer Challenge</h5>

        <Modal id="ResetModal"
          title="Reset Email Sent"
          show={this.state.sent}
          closeHandler={this.handleModalClose}
          body="Please check your email for a link to reset your password."
        />
        <Modal id="ForgotPassModal"
          title="Reset Email"
          show={this.state.forgotPass}
          closeHandler={this.handleModalClose}
          onConfirm={this.reset}>

          Enter your email and we will send a link with instructions
          on how to reset your password.
          <form onSubmit={this.reset}>
            <TextInput
              type="email"
              validationCss={emailInvalidCss}
              id="email"
              autoFocus
              value={this.state.email}
              onChange={this.handleChange} />
          </form>

        </Modal>

        <this.AuthError />

        <form id="LoginForm" className={`LoginForm pt-2 ${validationClass}`} onSubmit={this.handleSubmit} noValidate>
            <div className={`row`}>
                <label htmlFor="email"
                       className="col-3 col-form-label">
                    Email
                </label>
                <div className="col-9">
                    <TextInput
                      type="email"
                      validationCss={emailInvalidCss}
                      id="email"
                      className=""
                      required={true}
                      autoFocus
                      value={this.state.email}
                      onChange={this.handleChange} />
                </div>
                <div className="col-12 invalid-feedback">{this.state.emailErr}</div>
            </div>

            <div className="row">
              <label htmlFor="password" className="col-3 col-form-label">
                  Password
              </label>
              <div className="col-9">
                <TextInput
                    id="password"
                    validationCss={passInvalidCss}
                    className=""
                    required={true}
                    type="password"
                    value={this.state.password}
                    onChange={this.handleChange} />
              </div>
              <div className="col-12 invalid-feedback">{this.state.passErr}</div>
          </div>

          <div className="text-right">
            <button className="btn btn-link text-light"
              onClick={()=>{this.setState({forgotPass: true})}}
              type="button">Forgot password?</button>
          </div>

          <LoadingButton loading={this.state.loading} />
        </form>
      </div>
    );
  }

}

const LoadingButton = (props) => {

  let label = "Start";
  let css = "";
  let extra = {};
  if(props.loading) {
    label = "Authourizing...";
    css="disabled";
    extra = {disabled: "disabled"};
  }

  return (
    <button
      className={`StartButton btn btn-light btn-block ${css}`}
      {...extra}
      type="submit">
      {label}
    </button>
  )
}