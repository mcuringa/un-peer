import React from 'react';
import _ from "lodash";
import {CalendarIcon} from 'react-octicons';
import dateFormat from 'dateformat';
import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Link
} from 'react-router-dom';

import FBUtil from "../FBUtil";
import {User, Challenge, ChallengeDB} from "./Challenge.js"
import ChallengeResponseForm from "./ChallengeResponseForm.js"

const df = (d)=> dateFormat(d, "dd mmm yyyy");

class ChallengeDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    const id = this.props.match.params.id;
    this.state = {
      challenge: {id: id}, 
      owner: User
    };
  }

  componentWillMount() {
    const id = this.props.match.params.id;
    ChallengeDB.get(id,(c)=>{
      this.setState({"owner": c.owner});
      this.setState({challenge: c});
    });

  }

  render() {
    const action = this.props.match.params.action;
    let ActiveElement;
    switch(action) {
      case "r":
        ActiveElement = (<ChallengeResponseForm />);
        break;
      default:
       ActiveElement = (<ChallengeInfo id={this.state.challenge.id} 
              challenge={this.state.challenge} 
              owner={this.state.owner} />);


    }
    return (
      <div className="ChallengeDetail screen">
        <ChallengeHeader id={this.state.challenge.id} 
          challenge={this.state.challenge} 
          owner={this.state.owner} />
        {ActiveElement}
      </div>
    );
  }
}

const ChallengeHeader = (props) => {
  return (
    <div className="ChallengeDetailHeader">
      <div className="StartDate">
        <CalendarIcon/>
        {df(props.challenge.start)} - {df(props.challenge.end)}
      </div>
      <h4>{props.challenge.title}</h4>
      <div>Challenge owner: {props.owner.first} {props.owner.last}</div>
      <ChallengeButtons id={props.id} />
    </div>
  );
}



const ChallengeInfo = (props) => {

  return (
    <div className="ChallengeDescription">
      <div className="ChallengeVideo embed-responsive embed-responsive-16by9">
        <video controls="true" 
          poster="poster.jpg">
              <source src="https://firebasestorage.googleapis.com/v0/b/un-peer-challenges.appspot.com/o/testing%2Fchallenge-trial-video.mp4?alt=media&token=ec0ede16-1fd8-48f9-bf30-695aa4b77c24" type='video/mp4'/>
        </video>
      </div>
      <p>{props.challenge.prompt}</p>
    </div>
  );
}

const ChallengeButtons = (props) => {
  return (
    <div className="btn-toolbar">
      <div className="btn-group btn-group-justified" role="group">
        <NavLink className="btn btn-outline-secondary" exact={true} activeClassName="active" to={`/challenge/${props.id}`}>Info</NavLink>
        <a className="btn btn-outline-secondary disabled">Media</a>
        <NavLink className="btn btn-outline-secondary" activeClassName="active" to={`/challenge/${props.id}/r`}>Respond</NavLink>
        <a className="btn btn-outline-secondary disabled" activeClassName="active">Responses</a>
        <NavLink className="btn btn-outline-secondary" activeClassName="active" to={`/challenge/${props.id}/edit`} edit="true">Edit</NavLink>
      </div>
    </div>);
}


export default ChallengeDetailScreen;