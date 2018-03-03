import React from "react";
import Calendar from "react-calendar";
import {ChallengeDB, ChallengeStatus} from "./challenges/Challenge.js"

class CalendarScreen extends React.Component {
  
  constructor(props) {
    super(props);
    this.state = {
      challenges: []
    };
  }

  componentWillMount() {
    ChallengeDB.findByStatus(ChallengeStatus.PUBLISHED)
      .then((t) => {
        this.setState({challenges: t})
      });
  }

  render() {
    return (
      <div className="calendar-view">
          <Calendar
              calendarType="US"
              minDetail="month"
              view="month"
              />
          <div className="challenge-area">
              <div>Challenge of the week</div>
              <div>Rate the responses</div>
          </div>
      </div>
    ); 

  }

};

export default CalendarScreen;
