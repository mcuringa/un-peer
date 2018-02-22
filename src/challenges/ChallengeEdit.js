import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import {User, Challenge, ChallengeDB, ChallengeStatus} from "./Challenge.js"
import { PrimitiveDotIcon } from 'react-octicons';

import {ChallengeButtons} from "./ChallengeDetail.js";

import FBUtil from "../FBUtil";

import {
  TextGroup,
  TextInput,
  DatePicker,
  TextAreaGroup,
  StatusIndicator,
  LoadingSpinner,
  RadioButtonGroup,
  VideoUpload
} from "../FormUtil";

class ChallengeEditScreen extends React.Component {
  constructor(props) {
    super(props);

    const id = this.props.match.params.id || "";
    this.state = {
      challenge: Challenge, 
      owner: {displayName: props.user.displayName, email: props.user.email, id: props.user.uid},
      loading: true,
      dirty: false
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
    const id = this.props.match.params.id;
    ChallengeDB.get(id).then((c)=>{
      this.setState({"owner": c.owner});
      this.setState({challenge: c});
      this.setState({loading: false});
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
    console.log(file);

    console.log("target.id:" + key);

    FBUtil.uploadMedia(file, c.id).then((snapshot)=> {
      c[key] = snapshot.downloadURL;
      console.log("video before save: " + c.video);
      this.setState({challenge: c});
      console.log(this.state.challenge);
      this.save();
      console.log("save complete");

    });
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

    this.setState({ challenge: c, dirty: true });

    this.save();
  }


  handleStartDateChange(e) {
    console.log("changes to start date");
    const dayInMillis = 1000 * 60 * 60 * 24;
    let c = this.state.challenge;
    const date = ChallengeDB.parseDateControlToUTC(e.target.value);
    this.state.challenge.start = date;
    this.state.challenge.responseDue = new Date(date.getTime() + dayInMillis * 5);
    this.state.challenge.ratingDue = new Date(date.getTime() + dayInMillis * 7);
    this.state.challenge.end = new Date(date.getTime() + dayInMillis * 7);

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
        <ChallengeButtons id={this.state.challenge.id} />
        <form className="mt-2">

          <TextGroup id="title"
            value={c.title} 
            label="Challenge Title" 
            onChange={this.handleChange} 
            required={true} />
          
          <TextGroup id="tags"
            value={c.tags} 
            label="Tags" 
            placeholder="#People #Tech #Policy #Etc"
            onChange={this.handleChange}
            help="Add tags to make your challenge easier to search and group with similar challenges."
            required={false} />
          
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

          <img className="img" src={c.img} />
          <div className="custom-file">
            
            <input type="file" className="custom-file-input" id="img" onChange={this.handleUpload} />
            <label className="custom-file-label" htmlFor="img">Upload image</label>
          </div>

          <VideoUpload id="video" video={c.video} 
            onChange={this.handleUpload}
            label="Upload challenge video" />

          <TextAreaGroup id="prompt"
            value={c.prompt}
            label="Description"
            rows="8"
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

          </fieldset>
        
        </form>
      </div>);
  }
}

export default ChallengeEditScreen;