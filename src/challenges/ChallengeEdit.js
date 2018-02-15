import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import { Link } from 'react-router-dom'
import {User, Challenge, ChallengeDB, ChallengeStatus} from "./Challenge.js"
import { CalendarIcon, PrimitiveDotIcon } from 'react-octicons';

import FBUtil from "../FBUtil";

import {
  TextGroup,
  TextInput,
  DatePicker,
  TextAreaGroup,
  StatusIndicator,
  LoadingSpinner,
  RadioButtonGroup
} from "../FormUtil";

class ChallengeEditScreen extends React.Component {
  constructor(props) {
    super(props);
    const id = this.props.match.params.id || "";
    this.state = {
      challenge: Challenge, 
      owner: User,
      loading: true,
      dirty: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 2000);
  }

  componentWillMount() {
    const id = this.props.match.params.id;
    ChallengeDB.get(id,(c)=>{
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

  handleChange(e) {
    // console.log(e);
    // console.log(e.target.id);
    // console.log(e.target.name);
    // console.log(e.target.type);
    // console.log(e.target.value);

    let c = this.state.challenge;
    c[e.target.id] = e.target.value;
    this.setState({ challenge: c, dirty: true });
    this.save();
  }

  handleDateChange(e) {
    let c = this.state.challenge;
    const date = ChallengeDB.parseDateControlToUTC(e.target.value);
    c[e.target.id] = date;

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
          <div className="small text-muted">Owner: {this.state.owner.first} {this.state.owner.last}</div>
          <small className="text-muted"><tt>created: {ts(c.created)} | </tt></small>
          <small className="text-muted"><tt>modified: {ts(c.modified)}</tt></small>
        </div>
        <form>

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
              onChange={this.handleDateChange} />

            <DatePicker id="responseDue"
              value={c.responseDue}
              label="response due"
              onChange={this.handleDateChange} />

            <DatePicker id="ratingDue"
              value={c.ratingDue}
              label="rating due"
              onChange={this.handleDateChange} />


            <DatePicker id="end"
              value={c.end}
              label="challenge end"
              onChange={this.handleDateChange} />

          </fieldset>
        
        </form>
      </div>);
  }
}

export default ChallengeEditScreen;