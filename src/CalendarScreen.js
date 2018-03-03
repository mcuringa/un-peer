import React from "react";
import _ from "lodash";
import Calendar from "react-calendar";
import {ChallengeDB, ChallengeStatus} from "./challenges/Challenge.js"
import {isDateWithin, isSameDay} from "./Utils.js"

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

  formatDayName(value) {
    const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return dayNames[value.getDay()];
  }

  getTileClass(date, view) {
    let s = '';

    for (let i = 0; i < this.state.challenges.length; i++) {
      let challenge = this.state.challenges[i];
      if (isDateWithin(date.date, challenge.start, challenge.end)) {

        if (isSameDay(date.date, challenge.start)) {
          s += ` start ${challenge.stage} `;
        } else if (isSameDay(date.date, challenge.end)) {
          s += ` end ${challenge.stage} `;
        }

        return s === '' ? challenge.stage : s;
      }
    }

    return s;
  }

  render() {
    console.log(this.state.challenges);
    return (
      <div className="calendar-view">
          <Calendar
              calendarType="US"
              minDetail="month"
              view="month"
              formatShortWeekday={this.formatDayName}
              tileClassName={this.getTileClass.bind(this)}
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
