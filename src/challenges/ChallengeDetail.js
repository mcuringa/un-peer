import React from 'react';
import _ from "lodash";
import {NavLink} from 'react-router-dom';
import { ChevronLeftIcon } from "react-octicons";

import df from "../DateUtil"
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
    this.fromArchives = this.props.location.state && this.props.location.state.fromArchives

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
        <BackToArchives fromArchives={this.fromArchives} history={this.props.history} />
        <ChallengeHeader id={this.state.challenge.id} 
          history={this.props.history}
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

const BackToArchives = (props)=> {
  if(!props.fromArchives)
    return null;

  return (
    <div className="d-flex align-items-center clickable bg-light mb-2 no-Screen-padding border-bottom" onClick={props.history.goBack}>
      <ChevronLeftIcon className="m-2" />
      <div className="text-dark">Back to all past challenges</div>
    </div>
  )
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


  if(c.owner && c.owner.uid === props.user.uid) {

    return (
      <div className="alert alert-secondary" role="alert">
        <h6 className="alert-heading">Owner's Report</h6>
        <p>
          All responses to this challenge will be completed 
          by {df.time(c.responseDue)} on {df.fullDay(c.responseDue)}, 
          please mark your choice before {df.time(c.end)} on {df.fullDay(c.end)}.
        </p>
        <NavLink 
          className={`btn btn-secondary mb-2`} 
          activeClassName="active" 
          to={`/challenge/${props.id}/review`}>View responses</NavLink>
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
      <Video className="ChallengeVideo" video={props.challenge.challengeVideo} poster={props.challenge.videoPoster} />
      <p>{props.challenge.prompt}</p>
      <ChallengeButton id={props.id} 
        challenge={props.challenge}
        response={props.response}
        user={props.user} />
   </div>

  );
}



export default ChallengeDetailScreen;
