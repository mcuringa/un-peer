import React from 'react';
import FBUtil from "../FBUtil";
import _ from "lodash";

import Modal from "../Modal";

import db from "../DBTools";
import df from "../DateUtil";

import ProfileMenu from "./ProfileMenu.js"

import {MediaUpload} from "../MediaManager"
import {snack, SnackMaker} from "../Snackbar";



class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "dirty": false,
      user: props.user,
      profileImg: props.user.profileImg,
      reset: false

    };

    this.uploadSizeLimit = 2100000;

    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 2000);
    this.handleUpload = _.bind(this.handleUpload, this);
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
    this.clearImage = _.bind(this.clearImage, this);
  }

  componentWillMount() {
    const firebase = FBUtil.getFB();
    let fbu = firebase.auth().currentUser;
    this.setState({lastLogin:fbu.metadata.lastSignInTime});

  }



  clearImage() {
    const oldImage = this.state.profileImg;

    const undo = ()=>{
      this.setState({profileImg: oldImage});
      this.save();
    }
    const commit = ()=>{
      const data = { profileImg: this.state.profileImg };
      db.update("/users", this.props.user.uid, data)
    }

    this.setState({profileImg: null});
    this.snack("Profile image removed", true).then(commit, undo);


  }

  handleUpload(src, key) {

    this.setState({profileImg: src});
    this.save();
    
  }


  save() {

    this.snack("saving image");
    let u = this.props.user;
    u.profileImg = this.state.profileImg;
    const data = { profileImg: this.state.profileImg };
    db.update("/users", this.props.user.uid, data).then(()=>{
      this.snack("profile updated");
      this.props.updateAppUser(u);
    });


  } 

  handleChange(e) {
    let user = this.state.user;
    user[e.target.id] = e.target.value; 
    e.preventDefault();
    this.setState({user: user});
    this.save();

  }


  render() {
  
    const profileImg = this.state.profileImg || `data:image/png;base64,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`;

    return (
      <div className="ProfileScreen">
        <div className="d-flex flex-column mt-3 mb-2 justify-content-center border-light border-bottom">
          <MediaUpload id="profileImg" 
            className="ProfileImage margin-auto img-circle width-auto"
            media="img"
            imgOnly
            url={profileImg}
            handleUpload={this.handleUpload}
            clearMedia={this.clearImage}
          />

          <div className="mt-3 text-center">
            <div className="font-weight-bold">{`${this.props.user.firstName} ${this.props.user.lastName}`}</div>
            <div className="">{this.props.user.email}</div>
            <div className="">{df.ts(this.state.lastLogin)}</div>
          </div>
        </div>

        <ProfileMenu user={this.props.user} />

        <this.Snackbar />
        <Modal id="ResetModal"
          show={this.state.reset} 
          body="Please check your email for instructions on resetting your password."/>
      </div>
    );
  }
}


export default ProfileScreen;
