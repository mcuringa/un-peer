import React from "react";
import Calendar from "react-calendar";
import {ChallengeDB, ChallengeStatus} from "./challenges/Challenge.js";
import {isDateWithin, isSameDay} from "./Utils.js";

class CalendarScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenges: [],
      loading: true,
      selectedChallenge: null,
      showDetail: false
    };
  }

  componentWillMount() {
    ChallengeDB.findByStatus(ChallengeStatus.PUBLISHED)
      .then((t) => {
        console.log(t);
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
          s += ` start response-start ${challenge.stage} `;
        } else if (isSameDay(date.date, challenge.end)) {
          s += ` end published ${challenge.stage} `;
        }

        if (isSameDay(date.date, challenge.ratingDue)) {
          s += ` cont ${challenge.stage} rating-due `;
        } else if (isSameDay(date.date, challenge.responseDue)) {
          s += ` cont ${challenge.stage} response-due `;
        }

        s = (s === '') ? `cont ${challenge.stage}` : s;
        return s;
      }
    }

    return s;
  }

  getTileContent(date, view) {
    return (
      <React.Fragment>
          <svg className="calendar-dotline" height="14" width="50">
              <circle
                  cx="27" cy="5" r="5" strokeWidth="0"
                  fill="transparent" />
              <line
                  className="before"
                  x1="0" y1="5"
                  x2="28" y2="5"
                  stroke="transparent"
                  strokeWidth="3"
                  />
              <line
                  className="after"
                  x1="28" y1="5"
                  x2="50" y2="5"
                  stroke="transparent"
                  strokeWidth="3"
                  />
          </svg>
          <div className="d-flex">
              <time dateTime={date.date.toISOString()}>
                  {date.date.getDate()}
              </time>
          </div>
      </React.Fragment>
    );
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="loader-inner ball-pulse">
            <div></div>
            <div></div>
            <div></div>
        </div>
      );
    }

    return (
      <div className="calendar-view">
          <Calendar
              calendarType="US"
              minDetail="month"
              view="month"
              formatShortWeekday={this.formatDayName}
              tileClassName={this.getTileClass.bind(this)}
              tileContent={this.getTileContent.bind(this)}
              />
          <div className="container challenge-area">
              <div className="d-flex flex-row">
                  <div className="p-2">
                      <div className="challenge-dot respond"></div>
                  </div>
                  <div className="p-2 dot-text">
                      Respond to the challenges
                  </div>
              </div>
              <div className="d-flex flex-row">
                  <div className="p-2">
                      <div className="challenge-dot rating"></div>
                  </div>
                  <div className="p-2 dot-text">
                      Rate the responses
                  </div>
              </div>
              <div className="d-flex flex-row">
                  <div className="p-2">
                      <div className="challenge-dot published"></div>
                  </div>
                  <div className="p-2 dot-text">
                      Results published
                  </div>
              </div>
          </div>
      </div>
    );
  }
};

export default CalendarScreen;
