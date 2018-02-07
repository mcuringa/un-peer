import React from 'react';
import { Link } from 'react-router-dom';
import {CalendarIcon} from 'react-octicons';
import dateFormat from 'dateformat';
import _ from "lodash";

import FBUtil from "../FBUtil";


class ChallengeListItem extends React.Component {
  constructor(props) {
  super(props);

  }

  render() {
    const challenge = this.props.challenge;
    const start = dateFormat(challenge.start, "dd mmm yyyy");

    return (
      <Link to={`/challenge/${challenge.id}`}
        key={challenge.id} className="ChallengeItem">
        <div className="StartDate"><CalendarIcon/> {start}</div>
        <p className="ChallengeListTitle">{challenge.title}</p>
        <p>Submitted by: {challenge.owner.first} {challenge.owner.last}</p>
      </Link>
    );
  }
}


class ChallengeListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenges: []};

    let db = FBUtil.connect();
    db.collection("challenges").get().then((querySnapshot) => {
      let challenges = [];
      querySnapshot.forEach((doc) => {
        let c = {id: doc.id};
        c = _.merge(c, doc.data());
        // console.log(c);
        challenges.push(c);
        console.log(challenges.length);
      });
      this.setState({"challenges": challenges});
    });    
  }

  render() {
    const t = this.state.challenges.map((challenge) => {
      return (<ChallengeListItem challenge={challenge} />);
    });

    return (<div className="ChallengeList">{t}</div>);
  }
}




export default ChallengeListScreen;