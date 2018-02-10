import React from 'react';
import _ from "lodash";
import {CalendarIcon} from 'react-octicons';
import dateFormat from 'dateformat';
import { Link } from 'react-router-dom'
import {User, Challenge} from "./Challenge.js"

import FBUtil from "../FBUtil";


class ChallengeFormScreen extends React.Component {
  constructor(props) {
    super(props);
    const id = this.props.match.params.id || "";
    this.state = {
      challenge: {id: id}, 
      owner: User
    };

    let db = FBUtil.connect();
    let challenge = {};
    let owner = {};
  }

  render() {
    return (
      <div className="ChallengeDetail" key={this.state.challenge.id}>
      </div>);
  }
}