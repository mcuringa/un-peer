import React from 'react';
import _ from "lodash";
import { ChallengeDB } from "./Challenge.js"
import db from "../DBTools"
import FBUtil from "../FBUtil.js";
import {UploadProgress, formatFileSize} from "../MediaManager";
import {
  TextAreaGroup,
  VideoUploadImproved
} from "../FormUtil";
import Snackbar from "../Snackbar";
import ChallengeHeader from "./ChallengeHeader";


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
    this.snack = _.bind(this.snack, this);
    this.snack = _.throttle(this.snack, this.snackTime);

  }

  snack(msg, showUndo) {

    const p = (resolve, reject)=>
    {
      const clear = ()=> {
        this.setState({
          showSnack: false,
          snackMsg: "",
          snackUndo: null
        });
      }
      const over = ()=> {
        clear();
        resolve();
      }

      const undo = ()=> {
        clear();
        reject();
      }

      this.setState({
        showSnack: true,
        snackMsg: msg,
        showUndo: showUndo,
        snackUndo: undo,
        snackOver: over
      });      
    }

    return new Promise(p);

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

  handleUpload(e) {

    const challengeId = this.challengeId;

    let file = e.target.files[0];
    const path = `${challengeId}/professorVideo`;
    this.snack("uploading video");

    const succ = (task)=> {
      const filePath = task.snapshot.downloadURL;

      this.setState({
        video: filePath,
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
      this.snack("video upload failed");
      this.setState({
        uploadStatus: "Upload failed: " + e
      });
    }

    FBUtil.uploadMedia(file, path, watch, succ, err);
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
          screenTitle="Professor Response"
          challenge={this.state.challenge} 
          user={this.props.user} />

        <form onSubmit={(e)=>{e.preventDefault();}}>

          <VideoUploadImproved id="video" 
           video={this.state.video}
           onChange={this.handleUpload} 
           progressBar={progress}
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
        <Snackbar show={this.state.showSnack} 
          msg={this.state.snackMsg}
          showUndo={this.state.showUndo}
          undo={this.state.snackUndo}
          onClose={this.state.snackOver} />
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
