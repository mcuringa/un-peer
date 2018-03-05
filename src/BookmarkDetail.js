import React from "react";
import { Link } from 'react-router-dom';
import {ChevronLeftIcon, ChevronDownIcon, StarIcon} from 'react-octicons';
import {
  Accordion,
  AccordionItem,
  AccordionItemTitle,
  AccordionItemBody,
} from 'react-accessible-accordion';
import df from './DateUtil';
import StarRating from './StarRating';
import {ChallengeDB} from "./challenges/Challenge"

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
      challenge: null,
      challengeResponses: [],
      // Each item in this array is a Response
      bookmarks: [
        {
          title: 'a',
          challenge: 1,
          rating: 3,
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        },
        {
          title: 'b',
          challenge: 1,
          rating: 4,
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        },
        {
          title: 'c',
          challenge: 1,
          rating: 3,
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        },
        {
          title: 'd',
          challenge: 2,
          rating: 3,
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        },
        {
          title: 'e',
          challenge: 2,
          rating: 4,
          desc: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.'
        }
      ]
    };
  }

  componentWillMount() {
    const id = this.props.match.params.id;
    const obj = this.challenges.find(function (obj) {
      return window.parseInt(obj.id, 10) === window.parseInt(id, 10);
    });
    this.setState({
      challenge: obj,
      challengeResponses: this.state.bookmarks.filter(
        r => r.challenge === obj.id)
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
    const responses = this.state.bookmarks.filter(
      i => i.challenge === this.state.challenge.id);

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
