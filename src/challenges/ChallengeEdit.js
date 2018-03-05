import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import {Challenge, ChallengeDB, ChallengeStatus} from "./Challenge.js"
import FBUtil from "../FBUtil";

import {
  TextGroup,
  DatePicker,
  TextAreaGroup,
  StatusIndicator,
  VideoUpload
} from "../FormUtil";

import {UploadProgress, formatFileSize} from "../MediaManager";

let firebase = require("firebase");
require("firebase/storage");



class ChallengeEditScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      challenge: Challenge, 
      owner: {displayName: props.user.displayName, email: props.user.email, id: props.user.uid},
      loading: true,
      dirty: false,
      uploadStatus: "no upload running"
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 2000);
  }

  componentWillMount() {
    console.log("registerUpload:");
    console.log(this.props.registerUpload);
    const id = this.props.match.params.id;
    ChallengeDB.get(id).then((c)=>{
      this.setState({
        owner: c.owner,
        challenge: c,
        loading: false
      });
    });
  }

  save() {
    this.setState({loading: true});
    ChallengeDB.save(this.state.challenge)
    .then(()=>{this.setState({loading: false, dirty: false});});
  }

  handleSubmit(e) {
    this.save();
    e.preventDefault();
  }

  
  handleUpload(e) {

    let c = this.state.challenge;
    let file = e.target.files[0];
    const key = e.target.id;

    this.setState({dirty: true, loading: true});

    const succ = (task)=> {
      this.setState({
        uploadStatus: "Upload complete!"
      });

      c[key] = task.snapshot.downloadURL;
      this.setState({challenge: c});
      this.save();
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
        default:
          break;
      }
    }

    const err = (e)=>{
      console.log(e);
      this.setState({
        uploadStatus: "Upload failed: " + e
      });
    }

    FBUtil.uploadMedia(file, c.id, watch, succ, err);
  }



  handleChange(e) {

    let c = this.state.challenge;
    c[e.target.id] = e.target.value;
    this.setState({ challenge: c, dirty: true });
    this.save();
  }

  handleDateChange(e) {
    console.log("handleDateChange");

    let c = this.state.challenge;
    const date = ChallengeDB.parseDateControlToUTC(e.target.value);
    c[e.target.id] = date;

    if(date> this.state.challenge.endDate)
      c.endDate = date;

    this.setState({ challenge: c, dirty: true });

    this.save();
  }

  handleStartDateChange(e) {
    let c = this.state.challenge;
    const dayInMillis = 1000 * 60 * 60 * 24;
    const date = ChallengeDB.parseDateControlToUTC(e.target.value);

    c.start = date;
    c.responseDue = new Date(date.getTime() + dayInMillis * 5);
    c.ratingDue = new Date(date.getTime() + dayInMillis * 7);
    c.end = new Date(date.getTime() + dayInMillis * 7);

    this.setState({ challenge: c, dirty: true });

    this.save();
  }

  render() {
    const c = this.state.challenge;
    const ts = (d)=>dateFormat(d,"yyyy-mm-dd HH:MM:ss");
    const statusOptions = { };
    statusOptions[ChallengeStatus.DRAFT] = "draft";
    statusOptions[ChallengeStatus.REVIEW] = "review";
    statusOptions[ChallengeStatus.PUBLISHED] = "published";
    statusOptions[ChallengeStatus.ARCHIVED] = "archived";
    

    return (
      <div className="ChallengeEdit screen card bg-light">
        <div className="card-header">
          <div className="row">
            <div className="col-11">{c.title}</div>
            <div className="col-1">
              <StatusIndicator dirty={this.state.dirty} loading={this.state.loading} />
            </div>
          </div>
          <div className="small text-muted">Owner: {this.state.owner.name}</div>
          <small className="text-muted"><tt>created: {ts(c.created)} | </tt></small>
          <small className="text-muted"><tt>modified: {ts(c.modified)}</tt></small>
        </div>
        <form className="mt-2">

          <TextGroup id="title"
            value={c.title} 
            label="Challenge Title" 
            onChange={this.handleChange} 
            required={true} />
          
          <div className="form-group">
            <div className="input-group mb-3">
              <div className="input-group-prepend">
                <span className="input-group-text">Set Status</span>
              </div>
              <select id="status" value={c.status} className="custom-select" onChange={this.handleChange}>
                <option value={ChallengeStatus.DRAFT}>draft</option>
                <option value={ChallengeStatus.REVIEW}>review</option>
                <option value={ChallengeStatus.PUBLISHED}>published</option>
                <option value={ChallengeStatus.ARCHIVED}>archive</option>
              </select>
            </div>
          </div>

          <VideoUpload id="video" video={c.video} 
            onChange={this.handleUpload}
            label="Upload challenge video" />
          <UploadProgress pct={this.state.uploadPct} msg={this.state.uploadStatus} />

          <TextAreaGroup id="prompt"
            value={c.prompt}
            label="Description"
            rows="4"
            onChange={this.handleChange} />
          
          <fieldset>
            <legend>Schedule</legend>
            
            <DatePicker id="start"
              value={c.start}
              label="challenge start"
              onChange={this.handleStartDateChange} />

            <DatePicker id="responseDue"
              value={c.responseDue}
              label="response due"
              onChange={this.handleDateChange} />

            <DatePicker id="ratingDue"
              value={c.ratingDue}
              label="rating due"
              onChange={this.handleDateChange} />
            
            <DatePicker id="endDate"
              value={c.endDate}
              label="challenge end"
              onChange={this.handleDateChange} />

          </fieldset>
        
        </form>
      </div>);
  }
}

const Tags =(props)=> {
  return <TextGroup id="tags"
  value={props.tags} 
  label="Tags" 
  placeholder="#People #Tech #Policy #Etc"
  onChange={props.handleChange}
  help="Add tags to make your challenge easier to search and group with similar challenges."
  required={false} />;
}

export {ChallengeEditScreen, Tags};
