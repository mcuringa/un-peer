import React from 'react';
import _ from "lodash";
import {CalendarIcon} from 'react-octicons';
import dateFormat from 'dateformat';
import { Link } from 'react-router-dom'

import FBUtil from "../FBUtil";
import {User, Challenge, ChallengeDB} from "./Challenge.js"

const df = (d)=> dateFormat(d, "dd mmm yyyy");

class ChallengeDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    const id = this.props.match.params.id;
    this.state = {
      challenge: {id: id}, 
      owner: User
    };

    let db = FBUtil.connect();
    let challenge = {};
    let owner = {};
    ChallengeDB.loadChallenge(id,(c)=>{
      this.setState({"challenge": challenge});
      const owner = challenge.owner;
      // this.setState({"owner": owner});
    })

  }

  render() {
    return (
      <div className="ChallengeDetail" key={this.state.challenge.id}>
        <ChallengeTitle challenge={this.state.challenge} owner={this.state.owner} />
      </div>);
  }
}

const ChallengeTitle = (props) => {
  
  return (
    <div>
      <div className="card">
        <div className="StartDate"><CalendarIcon/> {df(props.challenge.start)}</div>
        <h4>{props.challenge.title}</h4>
        <div>By {props.owner.first} {props.owner.last}</div>
        <ChallengeButtons />
      </div>
      <div className="ChallengeDescription">
        <h6>Description</h6>
        <p>{props.challenge.prompt}</p>
      </div>
    </div>);
}


const ChallengeButtons = (props) => {
  return (
    <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
      <div className="btn-group mr-2" role="group" aria-label="First group">
        <button type="button" className="btn btn-primary">Info</button>  
        <button type="button" className="btn btn-primary">Media</button>
        <button type="button" className="btn btn-primary">Respond</button>
        <button type="button" className="btn btn-primary">Rate</button>
        <Link className="btn btn-primary" to="/challenge/{props.id}/edit">Edit</Link>
      </div>
    </div>);
}


export default ChallengeDetailScreen;