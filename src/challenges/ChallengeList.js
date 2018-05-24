import React from 'react';
import { Link } from 'react-router-dom';
import _ from "lodash";
import {ChevronRightIcon} from 'react-octicons';
import { CalendarIcon } from "../UNIcons";

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
      t = _.sortBy(challenges, "start");
      this.setState({challenges: t});
    });
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
  const c = props.challenge;
  const detailPath = {
    pathname: `/challenge/${c.id}`, 
    state: { fromArchives: true }
  }

  return (
    <Link to={detailPath} className="ChallengeItem">
      <div className="ChallengeItemHeader">
        <div className="d-flex align-items-start">
          <CalendarIcon />
          <div className="single-space pl-1">{df.range(c.start, c.end)}</div>
        </div>
      </div>
      <div className="ChallengeItemBody">
        <div>
          <h5 className="">{c.title}</h5>
          <div>Submitted by {c.owner.firstName} {c.owner.lastName}</div>
        </div>
        <div className="icon-lg"><ChevronRightIcon /></div>
      </div>
    </Link>
  );
}


export {ChallengeListScreen};
