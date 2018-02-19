import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import { ChallengeDB, User, Response } from "./Challenge.js"
import { CalendarIcon, PrimitiveDotIcon } from 'react-octicons';


import {
  TextGroup,
  TextInput,
  TextAreaGroup,
  StatusIndicator,
  LoadingSpinner,
} from "../FormUtil";

class ChallengeResponseForm extends React.Component {
  constructor(props) {
    super(props);
    const challengeId = this.props.challengeId;
    console.log(this.props.user);

    this.state = {
      "challengeId": challengeId,
      "response": Response, 
      "loading": true,
      "dirty": false
    };
    this.handleChange = this.handleChange.bind(this);
    this.publish = this.publish.bind(this);
    // this.save = _.debounce(this.save, 2000);
  }

  componentWillMount() {
    const challengeId = this.props.challengeId;
  }

  publish(e) {
    e.preventDefault();
    const challengeId = this.props.challengeId;
    let r = this.state.response;
    r.user = {email: this.props.user.email, name:this.props.user.displayName, uid: this.props.user.uid};
    ChallengeDB.addResponse(challengeId, r);
  }

  handleChange(e) {
    let r = this.state.response;
    r[e.target.id] = e.target.value;
    this.setState({response: r});
  }

  render() {
    let r = this.state.response;
    // console.log(this.)

    return (
      <form onSubmit={(e)=>{e.preventDefault();}}>
        <TextAreaGroup id="text"
          value={r.text}
          label="Text"
          rows="8"
          onChange={this.handleChange} />
        <button type="button" onClick={this.publish} className="btn btn-block btn-success">
          Publish my response
        </button>
      </form>);
  }
}



export default ChallengeResponseForm;
