import React from 'react';
import { Link } from 'react-router-dom';
import _ from "lodash";
import {PrimitiveDotIcon, ChevronRightIcon} from 'react-octicons';
import df from "../DateUtil";

import {ChallengeDB, ChallengeStatus} from "./Challenge.js"

class ChallengeListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenges: []};
  }
  componentWillMount() {
    ChallengeDB.findByStatus(ChallengeStatus.PUBLISHED).then((challenges)=>{
      const now = new Date();
      let t = _.filter(challenges, c=> c.end < now);
      t = _.sortBy(challenges, c=> c.start);
      this.setState({challenges: t});
    });
    this.props.setAppClass("hands");
  }

  componentWillUnmount() {
    this.props.setAppClass("");
  }

  render() {
    let t = this.state.challenges;
    t = t.map((challenge) => {
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


const ChallengeListItem = (props) => {
  const challenge = props.challenge;
  const dates = df.range(challenge.start, challenge.end);


  return (
    <Link to={`/challenge/${challenge.id}`}
      className="ChallengeItem d-flex align-items-center justify-content-between">
      <div className="p2 m-0">
        <div>
          <img src="/img/calendar.png" className="mr-2" alt="calendar icon" />
          {dates}
        </div>
        <h5 className="mt-3">{challenge.title}</h5>
        <p>Owner: {challenge.owner.firstName} {challenge.owner.lastName}</p>
      </div>
      <div><ChevronRightIcon /></div>
    </Link>
  );
}


export {ChallengeListScreen};
