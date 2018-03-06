import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import {XIcon} from "react-octicons";


import {Challenge, ChallengeDB, ChallengeStatus} from "./Challenge.js"
import FBUtil from "../FBUtil";

import {
  TextGroup,
  DatePicker,
  TextAreaGroup,
  StatusIndicator,
  VideoUploadImproved,
  ImageUpload
} from "../FormUtil";

import {UploadProgress, formatFileSize} from "../MediaManager";
import ChooseUser from "../users/ChooseUser";

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
    this.clearField = this.clearField.bind(this);
    this.selectProfessor = _.bind(this.selectProfessor, this);

  }

  clearField(key) { 
    let c = this.state.challenge;
    c[key] = "";
    this.setState({challenge: c });
  }

  componentWillMount() {
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

    console.log("handling upload");

    let c = this.state.challenge;
    let file = e.target.files[0];
    const key = e.target.id;

    this.setState({dirty: true, loading: true});

    const pctKey = key+"Pct";
    const msgKey = key+"Status";
    
    const succ = (task)=> {
      this.setState({
        [pctKey]: "",
        [msgKey]: 0
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
        [pctKey]: progress, 
        [msgKey]: `${xfer} of ${total}`
      });
    }

    const err = (e)=>{
      console.log(e);
      this.setState({
        [msgKey]: "Upload failed: " + e
      });
    }

    FBUtil.uploadMedia(file, c.id, watch, succ, err);
  }


  selectProfessor(u) {
      console.log("selectProfessor called")
      console.log(u.email);
    let c = this.state.challenge;
    c.professor = u;
    this.setState({ challenge: c, dirty: true });
    this.save();
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

          <ChallengeVideo 
            id="video"
            pct={this.state.videoPct} 
            msg={this.state.videoStatus} 
            clearVideo={()=>{this.clearField("video");}}
            video={c.video} 
            poster={c.videoPoster}
            handleUpload={this.handleUpload}
          />

          <ImageUpload 
            id="videoPoster"
            label="Video thumbnail"
            pct={this.state.videoPosterPct} 
            img={c.videoPoster} 
            onChange={this.handleUpload}
            clearImage={this.clearField}
            help="Upload a custom thumbnail image that users will see while your video loads, before they press play."
          />

          <ChooseProf challenge={this.state.challenge} selectUser={this.selectProfessor} />


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


const ChooseProf = (props)=> {
  const c = props.challenge;
  const Prof = (c.professor && c.professor.email)?
    (
      <div className="m-2">{c.professor.firstName} {c.professor.lastName} &lt;{c.professor.email}&gt;</div>
    ):
    (
      <div>
        <ChooseUser label="Choose professor" selectUser={props.selectUser} placeholder="find user" />
        <small className="text-muted">Choose the professor who will submit a video response to this challenge.</small>
      </div>
    );
  return (
    <div className="form-group">
      <label>Professor</label>
      {Prof}
      
    </div>
  )
}

const ChallengeVideo = (props)=> {
  const vidFileName = (path)=> {
    let start = path.lastIndexOf("/");
    let end = path.lastIndexOf("?")
    let fileName = (end==-1)?path.slice(start): path.slice(start,end);
    fileName = fileName.replace("%2F","/");
    return fileName;
  }


  const progress = (<UploadProgress pct={props.pct} msg={props.msg} />);
  const clearBtn = (props.video)?(
    <div className="bg-dark text-right text-light m-0 p-0">
      <small>
        {vidFileName(props.video)}
        <button className="btn btn-link mt-1 p-0 ml-2 mr-1" onClick={props.clearVideo}>
          <XIcon className="icon-danger" />
        </button>
      </small>
    </div>
    ) : "";

  const poster = props.poster || "/img/poster.png";

  return (
    <div className="mb-2">
      <VideoUploadImproved id="video" 
       className="m-0 p-0"
       video={props.video}
       poster={poster}
       onChange={props.handleUpload} 
       label=""
       progressBar={progress}
       />
      {clearBtn}     
    </div>

  );


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
