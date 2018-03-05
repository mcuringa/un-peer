import React from "react";
import { Link } from 'react-router-dom';
import {ChevronLeftIcon} from 'react-octicons';
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
      challenge: null
    };
  }

  componentWillMount() {
    const id = this.props.match.params.id;
    const obj = this.challenges.find(function (obj) {
      return window.parseInt(obj.id, 10) === window.parseInt(id, 10);
    });
    this.setState({
      challenge: obj
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
    return (
      <div className="BookmarkDetailScreen screen">
          <div>
              <BackButton />
              <h3>{this.state.challenge.title}</h3>
              <h5>Challenge owner: {this.state.challenge.owner.name}</h5>
          </div>


      </div>
    );
  }
};
