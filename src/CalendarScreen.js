import React from "react";
import _ from "lodash";
import df from './DateUtil.js';
import {ChallengeDB, ChallengeStatus} from "./challenges/Challenge.js"

class CalendarScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {challenges: [] };
  }

  componentWillMount() {
    ChallengeDB.findByStatus(ChallengeStatus.PUBLISHED)
      .then((t)=>{this.setState({challenges: t})});
  }

  render() {
    const dates = _.map(this.state.challenges,(c)=>{
      return <li>{c.title}: {df.range(c.start,c.end)}</li>
    });


    return (
      <div>
        <p>Just a placeholder for calendar</p>
        <ul>{dates}</ul>
      </div>
    ); 

  }

};

export default CalendarScreen;