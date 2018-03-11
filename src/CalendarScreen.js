import React from "react";
import Calendar from "react-calendar";
import {ChallengeDB, ChallengeStatus} from "./challenges/Challenge.js";
import df from "./DateUtil";

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

    let line = 0;
    for (let i = 0; i < this.state.challenges.length; i++) {

      let challenge = this.state.challenges[i];

      if (df.isDayWithin(date.date, challenge.start, challenge.end)) {
        // If we've already added classes for an event in this tile,
        // append -below to these classes, to tell CSS to use the SVG
        // element below the date, for overlaps.
        const below = (line === 0)? '' : '-below';

        if (df.isSameDay(date.date, challenge.start)) {
          s += ` start response-start${below} ${challenge.stage} `;
        } else if (df.isSameDay(date.date, challenge.end)) {
          s += ` end published ${challenge.stage} `;
        } else if (s === '') {
          s = ` cont ${challenge.stage} `;
        }

        let yesterday = new Date(date.date);
        yesterday.setDate(yesterday.getDate() - 1);
        let tomorrow = new Date(date.date);
        tomorrow.setDate(yesterday.getDate() + 1);

        if (
          df.isSameDay(date.date, challenge.ratingDue) &&
            !df.isSameDay(date.date, challenge.end)
        ) {
          s += ` rating-due${below} `;
        } else if (
          df.isSameDay(yesterday, challenge.responseDue) &&
            !df.isSameDay(tomorrow, challenge.end)
        ) {
          s += ` rating-start${below} `;
        } else if (df.isSameDay(date.date, challenge.responseDue)) {
          if (challenge.stage === 'future') {
            // If it's happening in the future, just assume a
            // response-due line is below.
            s += ' response-due-below ';
          } else {
            s += ` response-due${below} `;
          }
        } else if (
          date.date < challenge.responseDue &&
            !df.isSameDay(date.date, challenge.start)
        ) {
          if (challenge.stage === 'future') {
            // If it's happening in the future, just assume a
            // response-cont line is below.
            s += ' response-cont-below ';
          } else {
            s += ` response-cont${below} `;
          }
        } else if (
          date.date < challenge.ratingDue &&
            !df.isSameDay(date.date, challenge.start) &&
            !df.isSameDay(date.date, challenge.end)
        ) {
          s += ` rating-cont${below} `;
        }

        line++;
      }
    }

    return s;
  }

  getTileContent(date, view) {
    return (
      <React.Fragment>
          <svg className="calendar-dotline" height="14" width="50">
              <circle
                  cx="35" cy="5" r="5" strokeWidth="0"
                  fill="transparent" />
              <line
                  className="before"
                  x1="0" y1="5"
                  x2="36" y2="5"
                  stroke="transparent"
                  strokeWidth="2"
                  />
              <line
                  className="after"
                  x1="36" y1="5"
                  x2="50" y2="5"
                  stroke="transparent"
                  strokeWidth="2"
                  />
          </svg>
          <div className="d-flex">
              <time dateTime={date.date.toISOString()}>
                  {date.date.getDate()}
              </time>
          </div>
          <svg className="calendar-dotline-below" height="14" width="50">
              <circle
                  cx="35" cy="5" r="5" strokeWidth="0"
                  fill="transparent" />
              <line
                  className="before"
                  x1="0" y1="5"
                  x2="36" y2="5"
                  stroke="transparent"
                  strokeWidth="2"
                  />
              <line
                  className="after"
                  x1="36" y1="5"
                  x2="50" y2="5"
                  stroke="transparent"
                  strokeWidth="2"
                  />
          </svg>
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
                      <div className="challenge-dot respond">
                          <img src="/img/calendar_respond.png"
                               alt="Calendar respond icon" />
                      </div>
                  </div>
                  <div className="p-2 dot-text">
                      Respond to the challenges
                  </div>
              </div>
              <div className="d-flex flex-row">
                  <div className="p-2">
                      <div className="challenge-dot rating">
                          <img src="/img/calendar_rate.png"
                               alt="Calendar rate icon" />
                      </div>
                  </div>
                  <div className="p-2 dot-text">
                      Rate the responses
                  </div>
              </div>
              <div className="d-flex flex-row">
                  <div className="p-2">
                      <div className="challenge-dot published">
                          <img src="/img/calendar_results.png"
                               alt="Calendar results icon" />
                      </div>
                  </div>
                  <div className="p-2 dot-text">
                      Results published
                  </div>
              </div>
          </div>
      </div>
    );
  }
}

export default CalendarScreen;
