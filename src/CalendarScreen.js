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
      currentChallenge: null,
      loading: !this.props.challenges
    };

    this.now = new Date();
    this.tileWidth = 50;

  }

  componentWillMount() {
    
    if (this.props.challenges) {
      const currentChallenge = df.getChallengeForDate(this.props.challenges, this.now);
      this.setState({currentChallenge: currentChallenge});
    }

    const me = this;

    if (!this.state.challenges) {
      // If challenges aren't already there, supplied through this
      // component's props, then load them from firebase.
      ChallengeDB.findByStatus(ChallengeStatus.PUBLISHED)
        .then((t) => {
          const currentChallenge = df.getChallengeForDate(t, me.now);

          this.setState({
            challenges: t,
            currentChallenge: currentChallenge,
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

    const challenge = this.state.currentChallenge;

    if (df.isDayWithin(date.date, challenge.start, challenge.end)) {
      if (df.isSameDay(date.date, challenge.start)) {
        s += ` start response-start active ${challenge.stage} `;
      } else if (df.isSameDay(date.date, challenge.end)) {
        s += ` end published active ${challenge.stage} `;
      } else if (s === '') {
        s = ` cont active ${challenge.stage} `;
      }

      let yesterday = new Date(date.date);
      yesterday.setDate(yesterday.getDate() - 1);
      let tomorrow = new Date(date.date);
      tomorrow.setDate(tomorrow.getDate() + 1);

      if (
        df.isSameDay(date.date, challenge.ratingDue) &&
          !df.isSameDay(date.date, challenge.end)
      ) {
        s += ' rating-due ';
      } else if (df.isSameDay(yesterday, challenge.responseDue)) {
        if (df.isSameDay(tomorrow, challenge.end)) {
          // If the challenge end date is tomorrow, just hide the
          // connecting line, because there is only one day for
          // rating the challenge.
          s += ' rating-start hideline';
        } else {
          s += ' rating-start ';
        }
      } else if (df.isSameDay(date.date, challenge.responseDue)) {
        s += ' response-due ';
      } else if (
        date.date < challenge.responseDue &&
          !df.isSameDay(date.date, challenge.start)
      ) {
        s += ' response-cont ';
      } else if (
        date.date < challenge.ratingDue &&
          !df.isSameDay(date.date, challenge.start) &&
          !df.isSameDay(date.date, challenge.end)
      ) {
        s += ' rating-cont ';
      }

    }

    return s;
  }

  getTileContent(date, view) {
    return (
      <React.Fragment>
          <div className="d-flex">
              <div className="left"></div>
              <div className="right"></div>
          </div>
          <div className="dayDisplay">
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

    if(!this.state.currentChallenge)
      return <NoChallenge />

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

const NoChallenge = (props) => {
  return (
    <div id="NoCalendarChallenge" className="card border-dark mt-3">
      <div className="card-header"><h4>No Active Challenge</h4></div>
      <div className="card-body">
        <p className="card-text">
          Nothing is due right now. Check back for active challenges.
        </p>
      </div>
    </div>
  )
}

CalendarScreen.propTypes = {
  challenges: PropTypes.array
};

export default CalendarScreen;
