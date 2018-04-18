import React from 'react';
import { Redirect } from 'react-router-dom';
import _ from "lodash";

import { ChallengeDB } from "./Challenge.js"
import FBUtil from "../FBUtil.js";


import {snack, SnackMaker} from "../Snackbar";
import {UploadProgress, formatFileSize} from "../MediaManager";


import {
  TextGroup,
  TextAreaGroup,
  Checkbox,
  VideoUploadImproved
} from "../FormUtil";


import {MediaUpload} from "../MediaManager";

import ChallengeHeader from "./ChallengeHeader";

class ChallengeResponseForm extends React.Component {
  constructor(props) {
    super(props);
    this.challengeId = this.props.match.params.id;

    const emptyR = {
      title:"",
      text:"",
      video:"",
      videoOptOut: false
    }

    this.state = {
      challenge: {},
      response: emptyR,
      loading: true,
      dirty: false,
      choose: true,
      showConfirm: false,
      showVideo: false,
      validated: false,
      uploadStatus: "select a video to upload"
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.publish = this.publish.bind(this);
    this.confirmUpload = this.confirmUpload.bind(this);
    this.clearVideo = this.clearVideo.bind(this);
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
  }

  componentDidMount() {
    const id = this.props.match.params.id;
    ChallengeDB.get(id).then((c)=>{
        this.setState({challenge: c});
    });

    ChallengeDB.getResponse(id, this.props.user.uid)
      .then((r)=>{
        if(!r.videoOptOut)
          r.videoOptOut = false;
        this.setState({response: r});
      },()=>{console.log("no response");});
  }

  handleUpload(src, key) {

    let r = this.state.response;
    r.video = src;
    r.videoOptOut = false;

    this.setState({
      response: r,
      dirty: true, 
      loading: false,
      uploadStatus: "",
      uploadPct: 0
    }); 
    
  }

  _handleUpload(e) {

    const challengeId = this.challengeId;

    let file = e.target.files[0];
    const path = `${challengeId}/${this.props.user.uid}`;
    this.setState({dirty: true, loading: true});

    const succ = (task)=> {
      this.setState({
        uploadStatus: "Upload complete!"
      });

      const filePath = task.snapshot.downloadURL;
      let r = this.state.response;
      r.video = filePath;

      this.setState({
        response: r,
        dirty: true, 
        loading: false,
        uploadStatus: "",
        uploadPct: 0
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
    this.setState({loading: true});
    let savingMsg, savedMsg;
    if(!this.state.response.id) {
      savingMsg = "Publishing response";
      savedMsg = "Thank you! Response published";
    }
    else {
      savingMsg = "Updating response";
      savedMsg = "Response saved";
    }
    this.snack(savingMsg);

    const challengeId = this.challengeId;
    let r = this.state.response;
    r.user = this.props.user;
    ChallengeDB.addResponse(challengeId, r).then(()=>{
      this.setState({
        response: r,
        dirty: false, 
        loading: false,
        isValidated: false

      });
      this.snack(savedMsg);
    });
  }

  handleChange(e) {
    e.preventDefault();
    const r = this.state.response;
    r[e.target.id] = e.target.value;

    this.setState({response: r});
  }

  clearVideo() {
    let r = this.state.response;
    const oldVideoPath = r.video;
    const wasDirty = this.state.dirty;
    r.video = "";

    const commit = ()=> {
      this.setState({response: r, dirty: true});
    }

    const rollback = ()=> {
      r.video = oldVideoPath;
      this.setState({response: r, dirty: wasDirty});
    }

    this.snack("Video removed", true).then(commit, rollback);
  }

  render() {

    if(this.state.goHome)
      return <Redirect push to="/" />

    const toggleOptOut = ()=> {
      let r = this.state.response;
      if(r.video && r.video.length > 0)
        this.clearVideo();
      r.videoOptOut = !r.videoOptOut;
      this.setState({response: r});
    }

    return (
      <div className="ChallengeResponseForm screen">
        <ChallengeHeader id={this.state.challenge.id} 
          challenge={this.state.challenge} 
          owner={this.props.user}
          user={this.props.user} />

        <ResponseForm
          response={this.state.response}
          onChange={this.handleChange} 
          handleUpload={this.handleUpload}
          pct={this.state.uploadPct} 
          msg={this.state.uploadStatus}
          onSubmit={this.publish} 
          clearVideo={this.clearVideo} 
          toggleOptOut={toggleOptOut} />

          <this.Snackbar timeout={2000} />
      </div>
    )
  }
}

class ResponseForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {isValidated: false}
    this.submit = _.bind(this.submit, this);
  }


  submit(e) {
    e.preventDefault();
    e.stopPropagation();
    let form = document.getElementById("ResponseForm");
    
    let valid =  form.checkValidity();
    this.setState({ isValidated: true});

    if(!valid)
      return;

    this.props.onSubmit();
    this.setState({ isValidated: false});

  }

  render() {
    const props = this.props;
    let textRows = 3;
    let textError = "Please provide a short description of your response."
    
    if(props.response.videoOptOut) {
      textRows = 6;
      textError = "You must provide a written response to the challenge."
    }

    const VideoErrMsg = ()=> {
      if(props.pct > 0 && props.pct < 100)
        return (
          <div className="mb-1">
            You must wait until your video upload
            completes before submitting your response.
          </div>
        )

      return (
        <div className="mb-1">
          You must either <strong>upload a
          video</strong> or <strong>check, "Do not include 
          a video in my response,"</strong> before
          you can submit your response.
        </div>
      )
    }

    const validationClass = (this.state.isValidated)?"was-validated":"needs-validation";

    return (
      <form id="ResponseForm" className={validationClass} noValidate onSubmit={this.submit}>
        <TextGroup id="title"
          required={true}
          validationErrorMsg="Please enter a title for your response."
          value={props.response.title}
          label="Response title"
          onChange={props.onChange} />

        <div className="d-flex justify-content-end">
          <div className="font-weight-bold text-right"><small>Upload a short video (1-2 minutes).</small></div>
        </div>
        
        <MediaUpload id="video" 
          media="video"
          url={props.response.video}
          required={props.response.videoOptOut === false}
          handleUpload={props.handleUpload}
          clearMedia={props.clearVideo}
          maxFileSize={80*1000*1000}
          validationErrorMsg={<VideoErrMsg />}
        />


        <Checkbox
          id="videoOptOut"
          checked={props.response.videoOptOut}
          onClick={props.toggleOptOut}
          required={props.response.video.trim().length === 0}
          validationErrorMsg="Check this box if your response does not include a video."
          label="Do not include a video in my response" />
          
        <TextAreaGroup id="text"
          value={props.response.text}
          placeholder="Write a short description of your video."
          rows={textRows}
          required={true}
          validationErrorMsg={textError}
          onChange={props.onChange} />

        <SaveButtons response={props.response} />
      </form>
    )
  }
}

const SaveButtons = (props)=> {

  const saveWidth = "240px";
  if(props.response.id) {
    return (
      <div className="d-flex justify-content-end mb-2">
        <button type="submit" style={{width: saveWidth}}
          className={`btn btn-secondary mt-2`}>
          Update my response
        </button>
        <button type="button" 
          className={`btn btn-secondary mt-2 ml-2`}>
          Go home
        </button>
      </div>
    )
  }

  return (
    <div className="d-flex justify-content-end mb-2">
      <button type="submit" style={{width: saveWidth}}
        className={`btn btn-secondary mt-2`}>
        Submit my response
      </button>
    </div>
  )
}

export default ChallengeResponseForm;