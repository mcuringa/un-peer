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
  
    const profileImg = this.state.profileImg || "/img/profile.png";

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
