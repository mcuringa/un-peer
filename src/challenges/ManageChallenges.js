import React from 'react';
import { Link } from 'react-router-dom';
import _ from "lodash";
import {ChevronRightIcon} from 'react-octicons';
import df from "../DateUtil";

import {ChallengeDB, ChallengeStatus} from "./Challenge.js"

class ManageChallengesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenges: []};
  }
  componentWillMount() {
    ChallengeDB.findAll().then((t)=>{

      t = _.filter(t,c=>c.status !== ChallengeStatus.DRAFT);
      t = _.sortBy(t, c=> c.start);
      t = _.reverse(t);
      this.setState({challenges: t});
    });
  }

  componentWillUnmount() {
    this.props.setAppClass("");
  }

  render() {
    let t = this.state.challenges;
    t = t.map((challenge) => {
      return (
        <ChallengeRow 
          key={challenge.id} 
          challenge={challenge} />
      );
    });
    return (
      <div className="ChallengeListScreen screen">
        <div className="ChallengeList">
          <div className="bg-secondary text-light">
            <h5 className="mb-0 pl-3">CHALLENGES</h5>
          </div>
          <div className="row bg-secondary m-auto text-light">
            <div className="col-6">Title</div>
            <div className="col-3">Owner</div>
            <div className="col-2">Dates</div>
          </div>
          {t}
        </div>
      </div>
    );
  }
}


const ChallengeRow = (props) => {
  const challenge = props.challenge;
  const dates = df.range(challenge.start, challenge.end);


  return (
    <div className="row m-auto border-bottom border-light pb-2">
      <div className="col-6" style={{lineHeight: "1.1em"}}>{challenge.title}</div>
      <div className="col-3">{challenge.owner.firstName} {challenge.owner.lastName}</div>
      <div className="col-2">{df.shortRange(challenge.start, challenge.end)}</div>
      <div className="col-1">
        <Link to={`/challenge/${challenge.id}/edit`}><ChevronRightIcon /></Link></div>
    </div>
  )
}


export default ManageChallengesScreen;
