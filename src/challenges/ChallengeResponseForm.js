import React from 'react';
import { Redirect } from 'react-router-dom';
import { ChallengeDB } from "./Challenge.js"
import FBUtil from "../FBUtil.js";

import Modal from "../Modal";
import {UploadProgress, formatFileSize} from "../MediaManager";


import {
  TextGroup,
  TextAreaGroup,
  VideoUploadImproved
} from "../FormUtil";

import ChallengeHeader from "./ChallengeHeader";


require("firebase/storage");

class ChallengeResponseForm extends React.Component {
  constructor(props) {
    super(props);
    this.challengeId = this.props.match.params.id;

    const emptyR = {
      id:"",
      title:"",
      text:"",
      video:"",
    }

    this.state = {
      challenge: {},
      response: emptyR,
      loading: true,
      dirty: false,
      choose: true,
      showConfirm: false,
      showVideo: false,
      uploadStatus: "select a video to upload"

    };

    this.handleChange = this.handleChange.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.publish = this.publish.bind(this);
    this.chooseText = this.chooseText.bind(this);
    this.chooseVideo = this.chooseVideo.bind(this);
    this.confirmUpload = this.confirmUpload.bind(this);
    this.clearVideo = this.clearVideo.bind(this);
  }

  chooseText() { this.setState({showText: true, showVideo: false})}
  chooseVideo() { this.setState({showText: false, showVideo: true})}

  componentDidMount() {
    const id = this.props.match.params.id;
    ChallengeDB.get(id).then((c)=>{
        this.setState({challenge: c});
    });

    ChallengeDB.getResponse(id, this.props.user.uid)
      .then((r)=>{
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

    
    const showVideo = this.state.response.video || this.state.showVideo;
    const showText = !showVideo && (this.state.response.text || this.state.showText);
    const showMediaPicker = !showVideo && !showText;


    return (
      <div className="ChallengeResponseForm screen">
        <ChallengeHeader id={this.state.challenge.id} 
          challenge={this.state.challenge} 
          owner={this.props.user}
          user={this.props.user} />

      <form onSubmit={(e)=>{e.preventDefault();}}>

        <MediaPicker show={showMediaPicker} 
          chooseVideo={this.chooseVideo} chooseText={this.chooseText} />
    
        <TextResponse show={showText}
          response={this.state.response}
          onChange={this.handleChange} 
          onSubmit={this.confirmUpload} />

        <VideoResponse show={showVideo}
          response={this.state.response}
          onChange={this.handleChange} 
          handleUpload={this.handleUpload}
          pct={this.state.uploadPct} 
          msg={this.state.uploadStatus}
          onSubmit={this.confirmUpload} 
          clearVideo={this.clearVideo} />

        <Modal id="SubmitResponseModal"
          show={this.state.showConfirm} 
          title="Submit Response"
          body="Tap OK to submit your response fo this challenge."
          onConfirm={this.publish} />

        <Modal id="ShowNextModal"
          show={this.state.showNextChoice} 
          body="Submitted!"
          footer={NextChoice} />

      </form>
    </div>);
  }
}


const VideoResponse = (props) => {
  const empty = (s)=> !s || !s.trim();

  if(!props.show)
    return null;

  const progress = (<UploadProgress pct={props.pct} msg={props.msg} />);
  const clearBtn = (props.response.video)?(
    <button className="btn btn-block btn-sm btn-secondary float-right" onClick={props.clearVideo}>
      Remove video
    </button>
    ) : "";

  return (
    <div>
      <TextGroup id="title"
        value={props.response.title}
        label="Response title"
        onChange={props.onChange} />

      <VideoUploadImproved id="video" 
       video={props.response.video}
       poster="/img/poster.png"
       onChange={props.handleUpload} 
       label=""
       progressBar={progress}
       />
       <div className="row">
        <div className="col-8">
          <small className="text-muted">Upload a short (~1 minute) video with your response.</small>
        </div>
        <div className="col">{clearBtn}</div>
      </div>

      <TextAreaGroup id="text"
        value={props.response.text}
        placeholder="Write a short description of your video."
        rows="3"
        onChange={props.onChange} />

      <SubmitButton
        update={props.response.id}
        onSubmit={props.onSubmit}
        disabled={empty(props.response.text) || empty(props.response.text) || empty(props.response.video)}
        disabledMsg="Title & description are required. You can submit after your video uploads." />
    </div>
  );

}


const TextResponse = (props) => {

  const empty = (s)=> !s || !s.trim();

  if(!props.show)
    return null;

  return (
    <div>
      <TextGroup id="title"
        value={props.response.title}
        label="Response title"
        onChange={props.onChange} 
        requrired={true} />

      <TextAreaGroup id="text"
        value={props.response.text}
        label="Your written response"
        rows="6"
        requrired={true}
        onChange={props.onChange} />
      
      <SubmitButton
        update={props.response.id}
        onSubmit={props.onSubmit} 
        disabled={empty(props.response.text) || empty(props.response.title)}
        disabledMsg="Please enter a title and response before submitting."
      />
    </div>
  );

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
