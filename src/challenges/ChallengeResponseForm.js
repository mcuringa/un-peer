import React from 'react';
import _ from "lodash";
import { Redirect } from 'react-router-dom';
import dateFormat from 'dateformat';
import { ChallengeDB, User, Response } from "./Challenge.js"
import { CalendarIcon, PrimitiveDotIcon } from 'react-octicons';
import FBUtil from "../FBUtil.js";

import UNModal from "../Modal";

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
      "challengeId": challengeId,
      "response": this.props.response, 
      "loading": true,
      "dirty": false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.publish = this.publish.bind(this);
  }

  handleUpload(e) {

    const challengeId = this.props.challengeId;
    let r = this.state.response;

    let file = e.target.files[0];
    const path = `${challengeId}/${this.props.user.uid}`;
    this.setState({dirty: true, loading: true});

    FBUtil.uploadMedia(file, path)
      .then((snapshot)=>{
        const filePath = snapshot.downloadURL;

        r.video = filePath;
        this.setState({response: r});
        this.setState({dirty: false, loading: false});
      });
  }


  publish(e) {
    e.preventDefault();
    const challengeId = this.props.challengeId;
    let r = this.state.response;
    r.user = {email: this.props.user.email, name:this.props.user.displayName, uid: this.props.user.uid};
    ChallengeDB.addResponse(challengeId, r).then(()=>{
      this.setState({goToInfo: true});
      // this.setState({showNextChoice: true});
    });
  }

  handleChange(e) {
    let r = this.state.response;
    r[e.target.id] = e.target.value;
    this.setState({response: r});
  }

  render() {

    if(this.state.goToInfo)
      return <Redirect push to={`/challenge/${this.props.challengeId}`}/>
    
    let r = this.state.response;

    return (
      <form onSubmit={(e)=>{e.preventDefault();}}>
        <TextAreaGroup id="text"
          value={r.text}
          label="Write your response"
          rows="6"
          onChange={this.handleChange} />

        <VideoUpload id="video" video={r.video} 
          onChange={this.handleUpload}
          label="Upload your response" />

        <button type="button" onClick={this.publish} 
        className="btn btn-block btn-secondary mt-2">
          Submit my response
        </button>
      </form>);
  }
}



export default ChallengeResponseForm;
