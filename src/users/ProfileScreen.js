import React from 'react';
import FBUtil from "../FBUtil";

import Modal from "../Modal";

import df from "../DateUtil";

import ProfileMenu from "./ProfileMenu.js"



class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      user: props.user,
      reset: false
    };
  }

  componentWillMount() {
    const firebase = FBUtil.getFB();
    let fbu = firebase.auth().currentUser;
    this.setState({lastLogin:fbu.metadata.lastSignInTime});

  }



  render() {
  
    return (
      <div className="ProfileScreen">
        <div className="d-flex flex-column mt-3 mb-2 justify-content-center border-light border-bottom">
          <div className="mt-3 text-center mb-2">
            <div className="font-weight-bold">{`${this.props.user.firstName} ${this.props.user.lastName}`}</div>
            <div className="">{this.props.user.email}</div>
            <div className="">
              <small>last login</small><br />
              <small>{df.ts(this.state.lastLogin)}</small>
            </div>
          </div>
        </div>

        <ProfileMenu user={this.props.user} />

        <Modal id="ResetModal"
          show={this.state.reset} 
          body="Please check your email for instructions on resetting your password."/>
      </div>
    );
  }
}


export default ProfileScreen;
