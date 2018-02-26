import React from 'react';
import _ from "lodash";
import { Link, Redirect } from 'react-router-dom';
import dateFormat from 'dateformat';
import { ChallengeDB, User, Response } from "./Challenge.js"
import { CalendarIcon, PrimitiveDotIcon, ChevronLeftIcon } from 'react-octicons';
import FBUtil from "../FBUtil.js";

import Modal from "../Modal";
import {UploadProgress, formatFileSize} from "../MediaManager";


import {
  TextGroup,
  TextInput,
  TextAreaGroup,
  StatusIndicator,
  LoadingSpinner,
  VideoUpload
} from "../FormUtil";


let firebase = require("firebase");
require("firebase/storage");

class ChallengeResponseForm extends React.Component {
  constructor(props) {
    super(props);
    const challengeId = this.props.challengeId;

    this.state = {
      loading: true,
      dirty: false,
      choose: true,
      showConfirm: false,
      showVideo: false,
      uploadStatus: "no upload started"
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.publish = this.publish.bind(this);
    this.chooseText = this.chooseText.bind(this);
    this.chooseVideo = this.chooseVideo.bind(this);
    this.confirmUpload = this.confirmUpload.bind(this);
  }

  chooseText() { this.setState({showText: true, showVideo: false})}
  chooseVideo() { this.setState({showText: false, showVideo: true})}


  handleUpload(e) {

    const challengeId = this.props.challengeId;

    let file = e.target.files[0];
    const path = `${challengeId}/${this.props.user.uid}`;
    this.setState({dirty: true, loading: true});

    const succ = (task)=> {
      console.log("video uploaded");
      this.setState({
        uploadStatus: "Upload complete!"
      });

      const filePath = task.snapshot.downloadURL;
      console.log("path: " + filePath);

      this.props.responseHandler({video: filePath});
      this.setState({
        dirty: false, 
        loading: false,
        showVideo: true,
        uploadStatus: ""
      });
    }

    const watch = (snapshot)=> {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      const xfer = formatFileSize(snapshot.bytesTransferred, true);
      const total = formatFileSize(snapshot.totalBytes, true);

      this.setState( {
        uploadPct: progress, 
        uploadStatus: `${xfer} of ${total}`
      });

      switch (snapshot.state) {
        case firebase.storage.TaskState.PAUSED: // or 'paused'
          console.log('Upload is paused');
          break;
        case firebase.storage.TaskState.RUNNING: // or 'running'
          console.log('Upload is running');
          break;
      }
    }

    const err = (e)=>{
      console.log(e);
      this.setState({
        uploadStatus: "Upload failed: " + e
      });
    }

    FBUtil.uploadMedia(file, path, watch, succ, err);
  }

  confirmUpload() {
    this.setState({showConfirm: true});
  }

  publish() {
    console.log("publish");
    this.setState({showConfirm: false, loading: true});


    const challengeId = this.props.challengeId;
    let r = this.props.response;
    r.user = {email: this.props.user.email, name:this.props.user.displayName, uid: this.props.user.uid};
    ChallengeDB.addResponse(challengeId, r).then(()=>{
      this.setState({showNextChoice: true});
    });
  }

  handleChange(e) {

    this.setState({showConfirm: false}); 

    let r = this.props.response;
    r[e.target.id] = e.target.value;
    this.props.responseHandler(r);
  }

  render() {

    if(this.state.goHome)
      return <Redirect push to="/" />
    
    let el = (<MediaPicker show={!this.props.response.text && !this.props.response.video} 
          chooseVideo={this.chooseVideo} chooseText={this.chooseText} />);
    
    if(this.props.response.text || this.state.showText) {
      el = (
        <TextAreaGroup id="text"
          value={this.props.response.text}
          placeholder="Write your response"
          rows="6"
          onChange={this.handleChange} />
      );
    }
    else if(this.props.response.video || this.state.showVideo) {
      el = (
        <div>
          <VideoUpload id="video" video={this.props.response.video} 
            onChange={this.handleUpload} label="Upload a video" />
          <UploadProgress 
            pct={this.state.uploadPct} 
            msg={this.state.uploadStatus} />
        </div>
      );
    }


    const NextChoice = (
        <div>
          <button type="button" className="btn btn-secondary mr-2" data-dismiss="modal">View Response</button>
          <button type="button" data-dismiss="modal"
            onClick={()=>{this.setState({goHome: true, showNextChoice: false})}}
            className="btn btn-secondary">Home</button>
        </div>
      );


    return (
      <form onSubmit={(e)=>{e.preventDefault();}}>
        <Link className="text-dark mb-2"
          to={`/challenge/${this.props.challengeId}`}>
          <ChevronLeftIcon className="icon-dark pt-1 mr-1" />Back</Link>

        {el}

        <SubmitButton show={this.props.response.text || this.props.response.video} 
          update={this.props.response.id}
          onClick={this.confirmUpload} />

        <Modal id="ResetModal"
          show={this.state.showConfirm} 
          body="Submit your response?"
          onConfirm={this.publish} />

        <Modal id="ShowNextModal"
          show={this.state.showNextChoice} 
          body="Submitted!"
          footer={NextChoice} />

      </form>);
  }
}

const SubmitButton = (props) =>{

  if(!props.show)
    return null;

  const label = (props.update)?"Update my response":"Submit my response";

  return (
    <button type="button" onClick={props.onClick} 
      className={`btn btn-block btn-secondary mt-2`}>
      {label}
    </button>
  );
}

const MediaPicker = (props)=> {

  if(!props.show)
    return null;

  return (
    <div className="row mt-3">
      <div className="col-6">
        <div className="card pt-2 pb-2">
          <button type="button" className="btn btn-link d-block mt-4 mb-4"
            onClick={props.chooseVideo}>
            <img src="/img/video-response_btn.png" alt="text response icon" />
            <h5 className="pt-2 text-dark text-center">video</h5>
          </button>
        </div>
      </div>
      <div className="col-4 offset-sm-1">
        <div className="card">
          <button type="button" className="btn btn-link"
            onClick={props.chooseText}>
            <img src="/img/text-response_btn.png" alt="text response icon" />
            <h5 className="pt-2 text-dark text-center">text</h5>
          </button>
        </div>
      </div>
    </div>
  
  );

}

export default ChallengeResponseForm;
