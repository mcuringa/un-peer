import React from 'react';
import _ from "lodash";
import { ChallengeDB } from "./Challenge.js"
import db from "../DBTools"
import FBUtil from "../FBUtil.js";
import {MediaUpload} from "../MediaManager"
import {UploadProgress, formatFileSize} from "../MediaManager";
import {
  TextAreaGroup,
  VideoUploadImproved
} from "../FormUtil";
import Snackbar from "../Snackbar";
import ChallengeHeader from "./ChallengeHeader";
import {snack, SnackMaker} from "../Snackbar";


require("firebase/storage");

class ProfessorResponseForm extends React.Component {
  constructor(props) {
    super(props);
    this.challengeId = this.props.match.params.id;

    this.state = {
      challenge: {},
      text: "",
      video: "",
      uploadStatus: "select a video to upload"

    };

    this.handleChange = this.handleChange.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.save = this.save.bind(this);
    this.clearVideo = this.clearVideo.bind(this);
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);

  }


  componentDidMount() {
    ChallengeDB.get(this.challengeId).then((c)=>{
      this.setState({
        challenge: c,
        video: c.professorVideo,
        text: c.professorResponse
      });
    });
  }

  handleUpload(src, key) {
    this.setState({video: src});
    this.snack("Video upload complete");

  }

  save() {
    let data = {
      professorResponse: this.state.text,
      professorVideo: this.state.video
    };
    this.snack("saving...");
    db.update("/challenges", this.challengeId, data)
      .then(()=>{
        this.snack("Response saved!");
    });
  }

  handleChange(e) {
    this.setState({[e.target.id]: e.target.value});
  }

  clearVideo() {
    const undoVideo = this.state.video;
    const undo = ()=>{ this.setState({video: undoVideo}); }
    this.setState({video: ""});
    this.snack("video removed", true).then(this.save, undo);
  }

  render() {
    const prof = this.state.challenge.professor;
    if(prof && prof.uid !== this.props.user.uid)
      return null;


    const empty = (s)=> !s || !s.trim();
    const disabled = empty(this.state.text) || empty(this.state.video);
    const progress = (<UploadProgress pct={this.state.uploadPct} msg={this.state.uploadStatus} />);
    
    const ClearButton = ()=>{ 
      if(!this.state.video)
        return null;
      return (
        <button className="btn btn-block btn-sm btn-secondary mt-1 mb-2" 
          onClick={this.clearVideo}>
          Remove video
        </button>
      )
    }

    return (
      <div className="ProfResponseForm screen">
        <ChallengeHeader
          id={this.state.challenge.id} 
          history={this.props.history}
          screenTitle="Instructor Response"
          challenge={this.state.challenge} 
          user={this.props.user} />

        <form onSubmit={(e)=>{e.preventDefault();}}>
          
          <MediaUpload id="professorVideo" 
            media="video"
            path={this.state.challenge.id}
            url={this.state.video}
            poster={this.state.challenge.profVideoPoster}
            handleUpload={this.handleUpload}
            clearMedia={this.clearVideo}
          />

          <ClearButton />

          <TextAreaGroup id="text"
            value={this.state.text}
            placeholder="Enter your comments here."
            rows="4"
            onChange={this.handleChange} />

          <SubmitButton
            disabled={disabled}
            onSubmit={this.save} />
        </form>
        <this.Snackbar />
      </div>
    )
  }
}


const SubmitButton = (props)=>{

  const disabled = (props.disabled)?"disabled":"";
  const errCss = (props.disabled)? "": "d-none text-muted";
  
  return (
    <div>
      <button type="button" disabled={disabled} onClick={props.onSubmit} 
        className={`btn btn-block btn-secondary mt-2 ${disabled}`}>
        Save
      </button>
      <small className={errCss}>
        Comments are required. You can save after your video uploads.
      </small>
    </div>
  )
}

export default ProfessorResponseForm;
