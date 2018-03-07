import React from 'react';
import FBUtil from "../FBUtil";
import _ from "lodash";
import {StatusIndicator} from "../FormUtil";

import Modal from "../Modal";
import {ChallengeDB} from "../challenges/Challenge.js";


class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    let user = {
      email: props.user.email, 
      displayName: `${props.user.firstName} ${props.user.lastName}`, 
      uid: props.user.uid
    };

    this.state = {
      "loading": false,
      "dirty": false,
      user: user,
      reset: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.sendPass = this.sendPass.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 2000);
  }

  componentWillMount() {
    const firebase = FBUtil.init();
    let fbu = firebase.auth().currentUser;
    this.setState({lastLogin:fbu.metadata.lastSignInTime});

  }
  
  sendPass(e) {
    e.preventDefault();
    const firebase = FBUtil.init();
    console.log("reset clicked");
    console.log(this.props.user.email);

    
    firebase.auth().sendPasswordResetEmail(this.props.user.email)
      .then(()=> {
        console.log("reset succeeded");
        // $('#resetModal').modal();
        this.setState({
          sent: true,
          reset: true
        });
      })
      .catch((error)=> {
        console.log(error);
      });
  }

  save() {

    this.setState({loading: true});
    this.props.user.updateProfile({
      displayName: this.state.user.displayName
    }).then(()=> {
      this.setState({loading: false});
    }).catch(function(error) {
      console.log(error);
    });
  } 

  handleChange(e) {
    let user = this.state.user;
    user[e.target.id] = e.target.value; 
    e.preventDefault();
    this.setState({user: user});
    this.save();

  }

  signout() {
    const firebase = FBUtil.init();
    firebase.auth().signOut().then(()=> {
      console.log('Signed Out');
    }, (error)=> {
      console.error('Sign Out Error', error);
    });
  }

  render() {
    return (
      <div className="ProfileScreen screen">
        <div className="row">
          <div className="col-11"><h2>Your profile</h2></div>
          <div className="col-1">
            <StatusIndicator dirty={this.state.dirty} loading={this.state.loading} />
          </div>
        </div>
        <div className="row">
          <div className="col-sm-3 text-right"><strong>Name:</strong></div>
          <div className="col">{`${this.props.user.firstName} ${this.props.user.lastName}`}</div>
        </div>
        <div className="row">
          <div className="col-sm-3 text-right"><strong>Email:</strong></div>
          <div className="col">{this.props.user.email}</div>
        </div>
        <div className="row">
          <div className="col-sm-3 text-right"><strong>Last login:</strong></div>
          <div className="col">{this.state.lastLogin}</div>
        </div>
        <div className="mt-2 d-flex justify-content-end">
          <button type="button" onClick={this.sendPass} className="btn btn-secondary mr-2">Reset Password</button>
          
          <button type="button" onClick={this.signout} className="btn btn-secondary">
              Sign Out
          </button>
        </div>
        <Modal id="ResetModal"
          show={this.state.reset} 
          body="Please check your email for instructions on resetting your password."/>
      </div>
    );
  }
}


export default ProfileScreen;
