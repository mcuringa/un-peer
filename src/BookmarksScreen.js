import React from "react";
import _ from "lodash";
import Bookmarks from "react-calendar";
import {ChallengeDB, ChallengeStatus} from "./challenges/Challenge.js"

class BookmarksScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      bookmarks: []
    };
  }

  componentWillMount() {
    ChallengeDB.findByStatus(ChallengeStatus.PUBLISHED)
      .then((t) => {
        this.setState({challenges: t})
      });
  }

  render() {
    return (
      <div className="bookmarks-view">
          <h1>Bookmarks!</h1>
      </div>
    );
  }
};

export default BookmarksScreen;
