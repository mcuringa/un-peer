import React from 'react';
import _ from "lodash";
import {CalendarIcon, ArrowDownIcon} from 'react-octicons';
import dateFormat from 'dateformat';

import {
  NavLink,
} from 'react-router-dom';

import {User, ChallengeDB} from "./Challenge.js"
import ChallengeResponseForm from "./ChallengeResponseForm.js"
import ResponseList from "./ResponseList.js"

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
    ChallengeDB.get(id).then((c)=>{
      this.setState({"owner": c.owner});
      this.setState({challenge: c});
    });

  }

  render() {
    const action = this.props.match.params.action;
    let ActiveElement;
    switch(action) {
      case "r":
        ActiveElement = (
          <ChallengeResponseForm 
            user={this.props.user} 
            challengeId={this.state.challenge.id} />);
        break;
      case "responses":
        ActiveElement = (
          <ResponseList 
            user={this.props.user} 
            challengeId={this.state.challenge.id} />);
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
      <div>Challenge owner: {props.owner.name}</div>
      <ChallengeButtons id={props.id} />
    </div>
  );
}



const ChallengeInfo = (props) => {

  return (
    <div className="ChallengeDescription">
      <div className="ChallengeVideo embed-responsive embed-responsive-16by9">
        <video controls="true" src={props.challenge.video} />
      </div>
      <a className="btn btn-primary btn-sm float-right" 
        download href={props.challenge.video}>
        <ArrowDownIcon /><br />
        download</a>
      <p>{props.challenge.prompt}</p>
    </div>
  );
}




const ChallengeButtons = (props) => {
  return (
    <div className="ChallengeButtons btn-toolbar">
      <div className="btn-group btn-group-justified" role="group">
        <NavLink className="btn btn-block btn-outline-secondary" exact={true} activeClassName="active" to={`/challenge/${props.id}`}>Info</NavLink>
        <NavLink className="btn btn-block btn-outline-secondary" activeClassName="active" to={`/challenge/${props.id}/r`}>Respond</NavLink>
        <NavLink className="btn btn-block btn-outline-secondary" activeClassName="active" to={`/challenge/${props.id}/responses`}>Responses</NavLink>
        <NavLink className="btn btn-block btn-outline-secondary" activeClassName="active" to={`/challenge/${props.id}/edit`} edit="true">Edit</NavLink>
      </div>
    </div>);
}


export default ChallengeDetailScreen;
export {ChallengeButtons};