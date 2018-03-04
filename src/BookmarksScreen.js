import React from "react";
import { Link } from 'react-router-dom';
import {PrimitiveDotIcon, ChevronRightIcon} from 'react-octicons';
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
import {StarIcon} from 'react-octicons';
import df from './DateUtil';
import 'react-accessible-accordion/dist/fancy-example.css';

class BookmarkItem extends React.Component {
  render() {
    const response = this.props.response;
    return (
      <Link to="/response/"
          className="BookmarkItem d-flex align-items-center flex-row justify-content-between">
          <div className="p2 m-0">
              <div className="mb-2"><img className="mr-1" src="/img/calendar.png" alt="cal icon" />
                  {df.df(response.posted_on)}<PrimitiveDotIcon className={`pt-1 ml-1 mr-1`} />
              </div>
              <p className="ChallengeListTitle">{response.title}</p>
              <p>Submitted by: {response.owner.name}</p>
          </div>
          <div className="float-right"><ChevronRightIcon /></div>
      </Link>
    );
  }
};

class BookmarksScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bookmarks: [
        {
          title: 'Strategic Management',
          posted_on: new Date('2018-02-01'),
          owner: 'Sam Thorndike',
          responses: [
            {
              rating: 3
            },
            {
              rating: 4
            },
            {
              rating: 3
            }
          ]
        },
        {
          title: 'Internal Communication',
          posted_on: new Date('2018-01-24'),
          owner: 'Alice Li',
          responses: [
            {
              rating: 3
            },
            {
              rating: 4
            }
          ]
        }
      ]
    };
  }

  render() {
    const items = this.state.bookmarks.map((i, idx) => {

      const responses = i.responses.map((r, ridx) => {
        return <div key={ridx}>
          {r.rating} stars
          <button className={`Star btn btn-link filled`}><StarIcon /></button>
          </div>;
      });

      return <BookmarkItem key={idx} response={i} />;
    });

    return (
      <div className="BookmarksScreen screen">
          <div className="BookmarksList">{items}</div>
      </div>
    );
  }
};

export default BookmarksScreen;
