import React from 'react';
import _ from "lodash";
import {CalendarIcon, ArrowDownIcon} from 'react-octicons';
import df from "../DateUtil";
import {
  NavLink,
} from 'react-router-dom';

import {Video} from "../FormUtil.js"
import {User, ChallengeDB} from "./Challenge.js"
import ChallengeResponseForm from "./ChallengeResponseForm.js"
import ResponseList from "./ResponseList.js"


class ChallengeDetailScreen extends React.Component {
  constructor(props) {
    super(props);

    const id = this.props.match.params.id;
    this.state = {
      challenge: {id: id}, 
      owner: User,
      response: {}
    };
  }

  componentWillMount() {
    const id = this.props.match.params.id;
    ChallengeDB.get(id).then((c)=>{
      this.setState({"owner": c.owner});
      this.setState({challenge: c});
    });
    ChallengeDB.getResponse(id, this.props.user.uid)
      .then((r)=>{
        this.setState({response: r});
      },null);

  }

  render() {
    const action = this.props.match.params.action;
    let ActiveElement;
    switch(action) {
      case "r":
        ActiveElement = (
          <ChallengeResponseForm 
            user={this.props.user} 
            challengeId={this.state.challenge.id}
            response={ this.state.response } />);
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
              owner={this.state.owner} 
              response={this.state.response} />);


    }
    return (
      <div className="ChallengeDetail screen">
        <ChallengeHeader id={this.state.challenge.id} 
          challenge={this.state.challenge} 
          owner={this.state.owner} 
          user={this.props.user} />
        {ActiveElement}
      </div>
    );
  }
}

const ChallengeHeader = (props) => {
  return (
    <div className="ChallengeDetailHeader">
      <div className="StartDate">
        <img src="/img/calendar.png" className="mr-2" alt="calendar icon" />
        Response due: {df.day(props.challenge.response)}
      </div>
      <h4>{props.challenge.title}</h4>
      <div>Challenge owner: {props.owner.name}</div>
    </div>
  );
}

const ChallengeButton = (props) => {
  if(props.challenge.ratings > new Date())
    return null;

  const label = (props.response.user)?"View/Edit Response":"Take the challenge";

  return (
    <NavLink 
      className={`btn btn-block bt-lg btn-secondary`} 
      activeClassName="active" 
      to={`/challenge/${props.id}/r`}>{label}</NavLink>
 
  );
}


const ChallengeInfo = (props) => {

  return (
    <div className="ChallengeDescription">
      <Video className="ChallengeVideo" video={props.challenge.video} />
      <a className="btn btn-outline-primary btn-sm align-right" 
        download href={props.challenge.video}>download</a>
      <p>{props.challenge.prompt}</p>
      <ChallengeButton id={props.id} 
        challenge={props.challenge}
        response={props.response} />
   </div>

  );
}




const ChallengeButtons = (props) => {
  let editor = (props.user.editor || props.user.uid == props.owner.uid)?"d-none":"editor";
  console.log(editor);
  return (
    <div className="ChallengeButtons btn-toolbar">
      <div className="btn-group btn-group-justified" role="group">
        <NavLink 
          className={`btn btn-block btn-outline-secondary`} 
          exact={true} activeClassName="active" to={`/challenge/${props.id}`}>Info</NavLink>
        <NavLink 
          className={`btn btn-block btn-outline-secondary`} 
          activeClassName="active" to={`/challenge/${props.id}/r`}>Respond</NavLink>
        <NavLink 
          className={`btn btn-block btn-outline-secondary`} 
          activeClassName="active" to={`/challenge/${props.id}/responses`}>Responses</NavLink>
        <NavLink 
          className={`btn btn-block btn-outline-secondary ${editor}`} 
          activeClassName="active" to={`/challenge/${props.id}/edit`} edit="true">Edit</NavLink>
      </div>
    </div>);
}


export default ChallengeDetailScreen;
export {ChallengeButtons};