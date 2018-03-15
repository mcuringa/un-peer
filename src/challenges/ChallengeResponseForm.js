import React from 'react';
import { Redirect } from 'react-router-dom';
import _ from "lodash";

import { ChallengeDB } from "./Challenge.js"
import FBUtil from "../FBUtil.js";

import Modal from "../Modal";
import {UploadProgress, formatFileSize} from "../MediaManager";


import {
  TextGroup,
  TextAreaGroup,
  Checkbox,
  VideoUploadImproved
} from "../FormUtil";

import ChallengeHeader from "./ChallengeHeader";

class ChallengeResponseForm extends React.Component {
  constructor(props) {
    super(props);
    this.challengeId = this.props.match.params.id;

    const emptyR = {
      id:"",
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

  handleUpload(e) {

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
        dirty: false, 
        loading: false,
        showVideo: true,
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
    this.setState({showConfirm: false, loading: true});

    const challengeId = this.challengeId;
    let r = this.state.response;
    r.user = this.props.user;
    ChallengeDB.addResponse(challengeId, r).then(()=>{
      this.setState({showNextChoice: true});
    });
  }

  handleChange(e) {
    const r = this.state.response;
    r[e.target.id] = e.target.value;

    this.setState({response: r, showConfirm: false});
  }

  clearVideo() {
    let r = this.state.response;
    r.video = "";
    this.setState({response: r, showVideo: true });
  }

  render() {

    if(this.state.goHome)
      return <Redirect push to="/" />
    
    const NextChoice = (
        <div>
          <button type="button" className="btn btn-secondary mr-2"
            onClick={()=>{this.setState({showNextChoice: false})}}
            data-dismiss="modal">View Response</button>
          
          <button type="button" data-dismiss="modal"
            onClick={()=>{this.setState({goHome: true, showNextChoice: false})}}
            className="btn btn-secondary">Home</button>
        </div>
      );

    const toggleOptOut = ()=> {
      let r = this.state.response;
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
          onSubmit={this.confirmUpload} 
          clearVideo={this.clearVideo} 
          toggleOptOut={toggleOptOut} />

        <Modal id="SubmitResponseModal"
          show={this.state.showConfirm} 
          title="Submit Response"
          body="Tap OK to submit your response fo this challenge."
          onConfirm={this.publish} />

        <Modal id="ShowNextModal"
          show={this.state.showNextChoice} 
          body="Submitted!"
          footer={NextChoice} />
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
  }


  // componentDidUpdate(prevProps, prevState) {
  //   if(this.state.isValidated && document.getElementById(ResponseForm).checkValidity())
  //     this.setState({ isValidated: false });
  // }

  render() {
    const props = this.props;
    let textRows = 3;
    let textError = "Please provide a short description of your response."
    
    if(props.response.videoOptOut) {
      textRows = 6;
      textError = "You must provide a written response to the challenge."
    }

    const VideoErrMsg = ()=> {
      // if(!this.state.isValidated || this.state.videoOptOut)
      //   return null;

      if(props.pct > 0 && props.pct < 100)
        return (
          <div className="invalid-feedback">
            You must wait until your video upload
            completes before submitting your response.
          </div>
        )

      if(props.response.video.trim().length > 0)
        return null;

      return (
        <div className="invalid-feedback">
          You must either <em>upload a video</em>
          or <em>check <tt>Do not include a video in my response</tt></em>
          before you can submit your response.
        </div>
      )
    }

    const validationClass = (this.state.isValidated)?"was-validated":"needs-validation";

    console.log();

    return (
      <form id="ResponseForm" className={validationClass} noValidate onSubmit={this.submit}>
        <TextGroup id="title"
          required={true}
          validationErrorMsg="Please enter a title for your response."
          value={props.response.title}
          label="Response title"
          onChange={props.onChange} />

        <div className="d-flex justify-content-end">
          <div className="font-weight-bold text-right"><small>Upload a short (1-2 minute) video with your response.</small></div>
        </div>

        <VideoUploadImproved id="video" 
          video={props.response.video}
          poster="/img/poster.png"
          onChange={props.handleUpload} 
          label=""
          validationErrorMsg={VideoErrMsg}
          clearVideo={props.clearVideo}
          progressBar={(<UploadProgress pct={props.pct} msg={props.msg} />)} />
        <VideoErrMsg />

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

        <button type="submit" 
          className={`btn btn-block btn-secondary mt-2`}>
          Save
        </button>
      </form>
    )
  }
}



class SubmitButton extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showError: false
    }
  }

  render() {
    const label = (this.props.update)?"Update my response":"Submit my response";
    const disabled = (this.props.disabled)?"disabled":"";
    const help = (this.props.disabled)?this.props.disabledMsg:"";
    const showErr = ()=>{ this.setState( { showError: true }) };
    const submitAction = (this.props.disabled) ? showErr : this.props.onSubmit;
    const errCss = (this.state.showErr)? "text-small text-bold":"text-small text-muted";
    
    return (
      <div>
        <button type="button"  onClick={submitAction} 
          className={`btn btn-block btn-secondary mt-2 ${disabled}`}>
          {label}
        </button>
        <small className={errCss}>{help}</small>
      </div>
    );
  }
}

export default ChallengeResponseForm;
