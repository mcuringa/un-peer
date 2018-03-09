import React from "react";
import Calendar from "react-calendar";
import {ChallengeDB, ChallengeStatus} from "./challenges/Challenge.js"
import {isDateWithin, isSameDay, getChallengeForDate} from "./Utils.js"

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

  getTileContent(date, view) {
    const bgBlue = '#6A82AD';
    const bgBrightBlue = 'rgb(104, 153, 201)';
    const darkGrayText = 'rgb(105, 112, 120)';

    const a = <div className="bg-el">
          <time dateTime={date.date.toISOString()}>s</time>
          </div>;

    const cls = this.getTileClass(date, view);
    const drawCircle = cls.includes('start') || cls.includes('end');

    return (
      <div>
          <div className="d-flex">
              <div className="bg-el-left"></div>
              <div className="bg-el-right"></div>
          </div>
          <svg height="40" width="40">
              <circle
                  cx="20" cy="20" r="17" strokeWidth="0"
                  fill={drawCircle ? bgBrightBlue : 'transparent'} />
              <text
                  x="19.5" y="25"
                  fontFamily="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'"
                  textAnchor="middle"
                  fontWeight="bold"
                  fill={drawCircle ? 'white' : darkGrayText}
                  fontSize="14">
                  {date.date.getDate()}
              </text>
          </svg>
      </div>
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
