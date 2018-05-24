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
             src="data:image/png;base64,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" />

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