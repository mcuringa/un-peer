import React from 'react';
import { Link } from 'react-router-dom';
import {CalendarIcon, ChevronRightIcon} from 'react-octicons';
import dateFormat from 'dateformat';
import _ from "lodash";

import FBUtil from "../FBUtil";
import {User, Challenge, ChallengeDB} from "./Challenge.js"

const df = (d)=> dateFormat(d, "ddd mmm dd");

class ChallengeListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenges: []};
  }
  componentWillMount() {
    
    ChallengeDB.findAll().then((challenges)=>{
      this.setState({challenges: challenges.slice(1)});
    });

  }
  render() {
    const t = this.state.challenges.map((challenge) => {
      return (
        <ChallengeListItem 
          key={challenge.id} 
          home={this.props.home} 
          challenge={challenge} />
      );
    });
    return (
      <div className="ChallengeListScreen screen">
        <div className="ChallengeList">{t}</div>
      </div>
    );
  }
}

const ChallengeButton = (props)=> {
  if(!props.home)
    return null;

  return (
    <Link to="/challenge/new" className="NewChallengeButton btn">
      Submit a Challenge
    </Link>
  );
}

const ChallengeListItem = (props) => {
  const challenge = props.challenge;
  const start = df(challenge.start);
  const end = df(challenge.end);


  return (
    <Link to={`/challenge/${challenge.id}`}
      className="ChallengeItem d-flex align-items-center flex-row justify-content-between">
      <div className="p2 m-0">
        <div className="mb-2"><img className="mr-1" src="/img/calendar.png" alt="cal icon" />{start}</div>
        <p className="ChallengeListTitle">{challenge.title}</p>
        <p>Submitted by: {challenge.owner.name}</p>
      </div>
      <div className="float-right"><ChevronRightIcon /></div>
    </Link>
  );
}


export {ChallengeListScreen, ChallengeListItem};