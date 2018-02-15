import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import { ChallengeDB, User, Response } from "./Challenge.js"
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

class ChallengeResponseForm extends React.Component {
  constructor(props) {
    super(props);
    const challengeId = this.props.challengeId;
    this.state = {
      response: Response, 
      user: User,
      loading: true,
      dirty: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleChange.bind(this);
    // this.save = _.debounce(this.save, 2000);
  }

  componentWillMount() {
    const challengeId = this.props.challengeId;
  }


  handleSubmit(e) {
    ChallengeDB.addResponse(this.state.challengId, this.state.Response);
    e.preventDefault();
  }

  handleChange(e) {
    let r = this.state.response;
    r[e.target.id] = r.target.value;
  }

  render() {
    let r = this.state.response;

    return (
      <form onSubmit={(e)=>{e.preventDefault();}}>
        <TextAreaGroup id="text"
          value={r.text}
          label="Text"
          rows="8"
          onChange={this.handleChange} />
        <button type="button" onClick={this.handleSubmit} className="btn btn-block btn-success">
          Publish my response
        </button>
      </form>);
  }
}



export default ChallengeResponseForm;
