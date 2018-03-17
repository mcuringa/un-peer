import React from "react";
import PropTypes from 'prop-types';
import Calendar from "react-calendar";
import {ChallengeDB, ChallengeStatus} from "./challenges/Challenge.js";
import df from "./DateUtil";

class CalendarScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenges: this.props.challenges,
      loading: !this.props.challenges
    };

    this.now = new Date();
    this.tileWidth = 50;
  }

  componentWillMount() {
    if (!this.state.challenges) {
      // If challenges aren't already there, supplied through props,
      // then load them from firebase.
      ChallengeDB.findByStatus(ChallengeStatus.PUBLISHED)
        .then((t) => {
          this.setState({
            challenges: t,
            loading: false
          });
        });
    }
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
        //const below = (line === 0)? '' : '-below';

        if (df.isSameDay(date.date, challenge.start)) {
          s += ` start response-start ${challenge.stage} `;
        } else if (df.isSameDay(date.date, challenge.end)) {
          s += ` end published ${challenge.stage} `;
        } else if (s === '') {
          s = ` cont ${challenge.stage} `;
        }

        let yesterday = new Date(date.date);
        yesterday.setDate(yesterday.getDate() - 1);
        let tomorrow = new Date(date.date);
        tomorrow.setDate(tomorrow.getDate() + 1);

        if (
          df.isSameDay(date.date, challenge.ratingDue) &&
            !df.isSameDay(date.date, challenge.end)
        ) {
          s += ` rating-due `;
        } else if (df.isSameDay(yesterday, challenge.responseDue)) {
          if (df.isSameDay(tomorrow, challenge.end)) {
            // If the challenge end date is tomorrow, just hide the
            // connecting line, becaue there is only one day for
            // rating the challenge.
            s += ` rating-start hideline`;
          } else {
            s += ` rating-start `;
          }
        } else if (df.isSameDay(date.date, challenge.responseDue)) {
          s += ` response-due `;
        } else if (
          date.date < challenge.responseDue &&
            !df.isSameDay(date.date, challenge.start)
        ) {
          s += ` response-cont `;
        } else if (
          date.date < challenge.ratingDue &&
            !df.isSameDay(date.date, challenge.start) &&
            !df.isSameDay(date.date, challenge.end)
        ) {
          s += ` rating-cont `;
        }

        line++;
      }
    }

    return s;
  }

  getTileContent(date, view) {
    return (
      <React.Fragment>
          <svg className="calendar-dotline" height="2" width={this.tileWidth}>
              <line
                  className="before"
                  x1="0" y1="1"
                  x2="36" y2="1"
                  stroke="transparent"
                  strokeWidth="2"
                  />
              <line
                  className="after"
                  x1="36" y1="1"
                  x2={this.tileWidth} y2="1"
                  stroke="transparent"
                  strokeWidth="2"
                  />
          </svg>
          <div className="d-flex">
              <time dateTime={date.date.toISOString()}>
                  {date.date.getDate()}
              </time>
          </div>
          <svg className="calendar-dotline-below" height="9"
               width={this.tileWidth}>
              <line
                  className="before"
                  x1="0" y1="1"
                  x2="36" y2="1"
                  stroke="transparent"
                  strokeWidth="2"
                  />
              <line
                  className="after"
                  x1="36" y1="1"
                  x2={this.tileWidth} y2="1"
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

CalendarScreen.propTypes = {
  challenges: PropTypes.array
};

export default CalendarScreen;
