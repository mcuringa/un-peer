import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import { Link } from 'react-router-dom'
import {User, Challenge, ChallengeDB} from "./Challenge.js"
import { CalendarIcon, PrimitiveDotIcon } from 'react-octicons';

import FBUtil from "../FBUtil";

import {
  TextGroup,
  TextInput,
  DatePicker,
  TextAreaGroup,
  StatusIndicator,
  LoadingSpinner
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
    let c = this.state.challenge;
    c[e.target.id] = e.target.value;
    this.setState({ challenge: c, dirty: true });
    this.save();
  }

  handleDateChange(e) {
    let c = this.state.challenge;
    const date = ChallengeDB.parseDateControlToUTC(e.target.value);
    console.log("date changed");
    console.log(date);
    c[e.target.id] = date;

    this.setState({ challenge: c, dirty: true });

    this.save();
  }



  render() {
    const c = this.state.challenge;
    return (
      <div>
        <h3 className="">Challenge Edit Form
          <StatusIndicator dirty={this.state.dirty} loading={this.state.loading} /></h3>
        <form>
          <TextGroup id="title"
            value={c.title} 
            label="Challenge Title" 
            onChange={this.handleChange} 
            required={true} />
          
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