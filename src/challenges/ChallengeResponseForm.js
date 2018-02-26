import React from 'react';
import _ from "lodash";
import { Link, Redirect } from 'react-router-dom';
import dateFormat from 'dateformat';
import { ChallengeDB, User, Response } from "./Challenge.js"
import { CalendarIcon, PrimitiveDotIcon, ChevronLeftIcon } from 'react-octicons';
import FBUtil from "../FBUtil.js";

import Modal from "../Modal";
// import {ModalContainer, ModalDialog} from 'react-modal-dialog';

import {
  TextGroup,
  TextInput,
  TextAreaGroup,
  StatusIndicator,
  LoadingSpinner,
  VideoUpload
} from "../FormUtil";

class ChallengeResponseForm extends React.Component {
  constructor(props) {
    super(props);
    const challengeId = this.props.challengeId;

    this.state = {
      loading: true,
      dirty: false,
      choose: true,
      showConfirm: false,
      showVideo: false
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
    let r = this.props.response;

    let file = e.target.files[0];
    const path = `${challengeId}/${this.props.user.uid}`;
    this.setState({dirty: true, loading: true});

    FBUtil.uploadMedia(file, path).then((snapshot)=>{
        const filePath = snapshot.downloadURL;

        r.video = filePath;
        this.props.responseHandler(r);
        this.setState({dirty: false, loading: false});
      });
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
    
    if(this.props.response.text) {
      el = (
        <TextAreaGroup id="text"
          value={this.props.response.text}
          placeholder="Write your response"
          rows="6"
          onChange={this.handleChange} />
      );
    }
    else if(this.props.response.video){
      el = (
        <VideoUpload id="video" video={this.props.response.video} 
          onChange={this.handleUpload} label="Upload a video" />
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
      <div className="card col-6">
        <button type="button" className="btn btn-link mt-2"
          onClick={props.chooseVideo}>
          <img src="/img/video-response_btn.png" alt="text response icon" />
          <h5 className="pt-2 text-dark text-center">video</h5>
        </button>
      </div>
      <div className="card col-6">
        <button type="button" className="btn btn-link mt-2"
          onClick={props.chooseText}>
          <img src="/img/text-response_btn.png" alt="text response icon" />
          <h5 className="pt-2 text-dark text-center">text</h5>
        </button>
      </div>
    </div>
  
  );

}

export default ChallengeResponseForm;
