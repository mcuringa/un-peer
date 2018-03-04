import React from "react";
import _ from "lodash";
import Calendar from "react-calendar";
import {ChallengeDB, ChallengeStatus} from "./challenges/Challenge.js"
import {isDateWithin, isSameDay} from "./Utils.js"

class CalendarScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenges: [],
      loading: true
    };
  }

  componentWillMount() {
    ChallengeDB.findByStatus(ChallengeStatus.PUBLISHED)
      .then((t) => {
        this.setState({
          challenges: t,
          loading: false
        });
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

  onChange(v) {
    console.log('hey!', v);
  }

  getTileContent(date, view) {
    return <div>
      <div className="bg-el-left"></div>
      <div className="bg-el">
      <time dateTime={date.date.toISOString()}>
      {date.date.getDate()}
    </time>
      </div>
      <div className="bg-el-right"></div>
      </div>;
  }

  render() {
    if (this.state.loading) {
        return <div className="loader-inner ball-pulse">
            <div></div>
            <div></div>
            <div></div>
        </div>;
    }
    return (
      <div className="calendar-view">
          <Calendar
              calendarType="US"
              minDetail="month"
              view="month"
              onChange={this.onChange}
              formatShortWeekday={this.formatDayName}
              tileClassName={this.getTileClass.bind(this)}
              tileContent={this.getTileContent}
              />
          <div className="container challenge-area">
              <div className="d-flex flex-row">
                  <div className="p-2">
                      <div className="challenge-dot"></div>
                  </div>
                  <div className="p-2 dot-text">
                      Challenge of the week
                  </div>
              </div>
              <div className="d-flex flex-row">
                  <div className="p-2">
                      <div className="responses-dot"></div>
                  </div>
                  <div className="p-2 dot-text">
                      Rate the responses
                  </div>
              </div>
          </div>
      </div>
    );
  }
};

export default CalendarScreen;
