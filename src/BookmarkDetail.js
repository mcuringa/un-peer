import React from "react";
import { Link } from 'react-router-dom';
import _ from "lodash";
import {ChevronLeftIcon, ChevronDownIcon} from 'react-octicons';
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody,
} from 'react-accessible-accordion';
import df from './DateUtil';
import StarRating from './StarRating';
import {ChallengeDB} from "./challenges/Challenge";
import UserDB from './users/UserDB';

class BackButton extends React.Component {
  render() {
    return (
      <Link to="/bookmarks/" className="d-flex flex-row back-button">
          <div className="p-2">
              <ChevronLeftIcon />
          </div>
          <div className="p-2">
              Back to all bookmarks
          </div>
      </Link>
    );
  }
}

export default class BookmarkDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenge: null,
      challengeResponses: [],
      bookmark: null
    };
  }

  componentWillMount() {
    const me = this;
    const id = this.props.computedMatch.params.id;
    UserDB.getBookmarks(this.props.user.uid).then(function(a) {
      me.setState({
        bookmark: _.find(a, function(o) {
          return o.id === id;
        })
      });

      ChallengeDB.get(me.state.bookmark.challengeId).then(function(challenge) {
        me.setState({challenge: challenge});
      });
    });
  }

  render() {
    if (!this.state.challenge) {
      return (
        <div className="BookmarkDetailScreen screen">
            <BackButton />
            <h3>Not found</h3>
        </div>
      );
    }

    const responses = [];
    const responseItems = responses.map((i, idx) => {
      return (
        <AccordionItem key={idx}>
            <AccordionItemTitle>
                <div className="d-flex d-row justify-content-between">
                    <div>
                        <h5>{idx} : {i.title}</h5>
                        <div>
                            <StarRating
                                responseId={idx}
                                rating={i.rating} />
                        </div>
                    </div>
                    <div className="ml-auto">
                        <ChevronDownIcon />
                    </div>
                </div>
            </AccordionItemTitle>
            <AccordionItemBody>
                <p>{i.desc}</p>
            </AccordionItemBody>
        </AccordionItem>
      );
    });

    return (
      <div className="BookmarkDetailScreen screen">
          <BackButton />

          <div className="d-flex d-row justify-content-between">
              <div className="mb-2 p-3">
                  <img className="mr-1"
                       src="/img/calendar.png"
                       alt="cal icon" />
                  Posted on {df.df(this.state.challenge.posted_on)}
              </div>
              <div className="mb-2 p-3 ml-auto">
                  <img className="mr-1"
                       src="/img/footer/Bookmarks_unclicked_btn.png"
                       alt="Heart icon" />
                  {this.state.challengeResponses.length} response{this.state.challengeResponses.length === 1 ? '' : 's'}
              </div>
          </div>

          <div className="container">
              <h3>{this.state.challenge.title}</h3>
              <h5>Challenge owner: {this.state.challenge.owner.name}</h5>
          </div>

          <Accordion>
              {responseItems}
          </Accordion>

      </div>
    );
  }
};
