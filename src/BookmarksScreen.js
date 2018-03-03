import React from "react";
import _ from "lodash";
import {
    Accordion,
    AccordionItem,
    AccordionItemTitle,
    AccordionItemBody,
} from 'react-accessible-accordion';
import df from './DateUtil';
import 'react-accessible-accordion/dist/fancy-example.css';

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
    const items = this.state.bookmarks.map((i) => {

      const responses = i.responses.map((r) => {
        return <div>{r.rating} stars</div>;
      });

      return <AccordionItem>
        <AccordionItemTitle>
        <div>Posted on {df.df(i.posted_on)}</div>
        <h3>{i.title}</h3>
        <h5>Challenge owner: {i.owner}</h5>
        </AccordionItemTitle>
        <AccordionItemBody>
        {responses}
        </AccordionItemBody>
        </AccordionItem>;
    });

    return (
      <div className="bookmarks-view">
          <Accordion>
              {items}
          </Accordion>
      </div>
    );
  }
};

export default BookmarksScreen;
