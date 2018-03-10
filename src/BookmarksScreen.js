import React from "react";
import { Link } from 'react-router-dom';
import _ from "lodash";
import {ChevronRightIcon} from 'react-octicons';
import UserDB from './users/UserDB';
import {ChallengeDB} from './challenges/Challenge';
import df from './DateUtil';
import 'react-accessible-accordion/dist/fancy-example.css';

class BookmarkItem extends React.Component {

  render() {
    const bookmark = this.props.bookmark;
    const challenge = this.props.challenge;
    return (
      <Link to={`/bookmark/${bookmark.id}/`}
          className="BookmarkItem d-flex align-items-center flex-row">
          <div className="container">
              <div className="d-flex d-row justify-content-between">
                  <div className="mb-2">
                      <img className="mr-1"
                           src="/img/calendar.png"
                           alt="cal icon" />
                      {df.df(bookmark.posted_on)}
                  </div>
                  <div className="mb-2 ml-auto">
                      <img className="mr-1"
                           src="/img/footer/Bookmarks_unclicked_btn.png"
                           alt="Heart icon" />
                      {this.props.responseCount} response{this.props.responseCount === 1 ? '' : 's'}
                  </div>
              </div>
              <h3 className="BookmarksListTitle">{bookmark.title}</h3>
              <p>Submitted by {challenge && challenge.owner.firstName + ' ' + challenge.owner.lastName}</p>
          </div>
          <div className="float-right"><ChevronRightIcon /></div>
      </Link>
    );
  }
};

class BookmarksScreen extends React.Component {
  constructor(props) {
    super(props);
    this.challenges = [
      {
        id: 1,
        title: 'Strategic Management',
        posted_on: new Date('2018-02-01'),
        owner: {
          name: 'Sam Thorndike'
        },

      },
      {
        id: 2,
        title: 'Internal Communication',
        posted_on: new Date('2018-01-24'),
        owner: {
          name: 'Alice Li'
        }
      }
    ];

    this.state = {
      bookmarks: [],
      challenges: []
    };
  }

  componentWillMount() {
    const me = this;
    UserDB.getBookmarks(this.props.user.uid).then(function(a) {
      me.setState({
        bookmarks: a
      });

      let pArr = [];
      a.forEach(function(bookmark) {
        pArr.push(ChallengeDB.get(bookmark.challengeId));
      });

      Promise.all(pArr).then(function(challenges) {
        me.setState({challenges: challenges});
      });
    });
  }

  render() {
    const me = this;
    const items = this.state.bookmarks.map((i, idx) => {

      const challengeResponses = me.state.bookmarks.filter(
        r => r.challenge === i.id);

      const challenge = _.find(me.state.challenges, function (o) {
        return o.id === i.challengeId;
      });

      return (
        <BookmarkItem
            key={idx}
            bookmark={i}
            challenge={challenge}
            responseCount={challengeResponses.length} />
      );
    });

    return (
      <div className="BookmarksScreen screen">
          <div className="BookmarksList">{items}</div>
      </div>
    );
  }
};

export default BookmarksScreen;
