import React from 'react';
import _ from "lodash";
import {NavLink} from 'react-router-dom';

import {Video} from "../FormUtil.js"
import {User, ChallengeDB} from "./Challenge.js"

import ChallengeHeader from "./ChallengeHeader";

class ChallengeDetailScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      challenge: {}, 
      owner: User,
      response: {}
    };
    this.updateResponse = this.updateResponse.bind(this);

  }

  componentDidMount() {
    const id = this.props.match.params.id;

    ChallengeDB.get(id).then((c)=>{
      this.setState({
        owner: c.owner,
        challenge: c
      });
    });
  }

  updateResponse(props) {
    const r = _.merge(this.state.response, props);
    this.setState({response: r});
  }

  render() {
    return (
      <div className="ChallengeDetail screen">
        <ChallengeHeader id={this.state.challenge.id} 
          challenge={this.state.challenge} 
          owner={this.state.owner} 
          user={this.props.user} />
        <ChallengeInfo id={this.state.challenge.id} 
          challenge={this.state.challenge} 
          owner={this.state.owner} 
          response={this.state.response}
          user={this.props.user} />
      </div>
    );
  }
}

const ChallengeButton = (props) => {
  const c = props.challenge;

  if(c.professor && c.professor.uid === props.user.uid) {
    return (
      <div>
        <NavLink 
          className={`btn btn-block bt-lg btn-secondary mb-2`} 
          activeClassName="active" 
          to={`/challenge/${props.id}/review`}>Select the best response</NavLink>
        
        <NavLink 
          className={`btn btn-block bt-lg btn-secondary`} 
          activeClassName="active" 
          to={`/challenge/${props.id}/prof`}>Make/upload a wrap-up video</NavLink>
      </div>
    )
  }



  if(c.stage === "active") {

    const label = (props.response.user)?"View/Edit Response":"Take the challenge";

    return (
      <NavLink 
        className={`btn btn-block bt-lg btn-secondary`} 
        activeClassName="active" 
        to={`/challenge/${props.id}/respond`}>{label}</NavLink>
      );
  }
  
  if(c.stage === "rating") {
    return (
      <NavLink 
        className={`btn btn-block btn-secondary`} 
        activeClassName="active" to={`/challenge/${props.id}/rate`}>Rate Responses</NavLink>
    );
  }
  
  if(c.stage === "archive" || c.stage === "review") {
    return (
      <NavLink 
        className={`btn btn-block btn-secondary`} 
        activeClassName="active" to={`/challenge/${props.id}/review`}>See All Responses</NavLink>
    );
  }

  return null;

}


const ChallengeInfo = (props) => {

  return (
    <div className="ChallengeDescription">
      <Video className="ChallengeVideo" video={props.challenge.video} poster={props.challenge.videoPoster} />
      <p>{props.challenge.prompt}</p>
      <ChallengeButton id={props.id} 
        challenge={props.challenge}
        response={props.response}
        user={props.user} />
   </div>

  );
}



export default ChallengeDetailScreen;
