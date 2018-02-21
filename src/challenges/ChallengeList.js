import React from 'react';
import { Link } from 'react-router-dom';
import {CalendarIcon} from 'react-octicons';
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
      if(this.props.home)
        this.setState({challenges: challenges.slice(0,1)});
      else
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
      <div className="screen home">
        <div className="ChallengeList">{t}</div>
        <ChallengeButton home={this.props.home} />
      </div>
    );
  }
}

const ChallengeButton = (props)=> {
  if(!props.home)
    return null;

  return (
    <Link to="/challenge/new" className="NewChallengeButton">
      Submit a Challenge
    </Link>
  );
}

const ChallengeListItem = (props) => {
  const challenge = props.challenge;
  const start = df(challenge.start);
  const end = df(challenge.end);
  let clazz = "ChallengeItem d-flex align-items-center";
  if(props.home)
    clazz = clazz + " home";

  return (
    <Link to={`/challenge/${challenge.id}`} className={clazz}>
    <div className="p2">
      <div className="StartDate text-right">{start} - {end}</div>
      <p className="ChallengeListTitle">{challenge.title}</p>
      <p>Submitted by: {challenge.owner.name}</p>
    </div>
    </Link>
  );
}




export default ChallengeListScreen;