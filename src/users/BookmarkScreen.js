import React from 'react';
import {Link} from 'react-router-dom';
import _ from "lodash";

import df from "../DateUtil.js";
import db from "../DBTools.js";

import {ChevronRightIcon} from 'react-octicons';
import LoadingModal from "../LoadingModal";
import {snack, SnackMaker} from "../Snackbar";

class BookmarkScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true
    };

    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
  }

  componentWillMount() {

    const sortBookmarks = (bookmarks)=> {

      let challenges = _.sortBy(bookmarks, "challengeStart");
      let index = _.map(challenges, "challengeId");
      index = _.uniq(index);
      challenges = _.groupBy(challenges, "challengeId");
      this.setState({challenges: challenges, challengeStartIndex: index,  loading: false});
    }

    if(!this.props.user.bookmarks) {
      const path = `/users/${this.props.user.uid}/bookmarks`;
      db.findAll(path).then(sortBookmarks);
    }
    else {
      sortBookmarks(this.props.user.bookmarks);
    }
  }

  render() {

    let main;
    if(this.state.loading)
      main =  (<LoadingModal status="Loading favourites" show={true} />)
    else if(this.state.challenges.length === 0)
      main = <NoBookmarks />
    else {
      main = (
        <ChallengeList
          challenges={this.state.challenges}
          index={this.state.challengeStartIndex}
          user={this.props.user}
          showBookmarks={this.showBookmarks}  />
      );
    }

    return (
      <div className="BookmarkScreen screen p-0">
        {main}
        <this.Snackbar />
      </div>
    );
  }
}

const ChallengeList = (props)=> {
  const challenges = props.challenges;
  const ix = props.index;

  let ChallengeListElement = [];
  _.each(ix, (key, i)=>{
    const t = challenges[key];
    const first = (t[0].challengeOwner)?t[0].challengeOwner.firstName : "";
    const last = (t[0].challengeOwner)?t[0].challengeOwner.lastName : "";
    const c = {
      id: t[0].challengeId,
      title: t[0].challengeTitle,
      start: t[0].challengeStart,
      end: t[0].challengeEnd,
      owner: {
        firstName: first,
        lastName: last
      },
      bookmarks: t
    }

    ChallengeListElement.push(
      <Challenge 
        challenge={c} 
        key={`BookmarkChallenge_${i}`}
        keyIndex={i}
        user={props.user} 
        showBookmarks={props.showBookmarks} />
    );
  });
  return (<div>{ChallengeListElement}</div>);
}

const Challenge =(props)=> {
  const c = props.challenge;
  return (
    <Link to={`/bookmarks/${c.id}`} className="ChallengeItem">
      <div className="ChallengeItemHeader">
        <div>
          <img src="/img/calendar.png" className="mr-2" alt="calendar" />
          {df.range(c.start, c.end)}
        </div>
        <div className="">
          <img className="pr-1" src="/img/footer/Bookmarks_unclicked_btn.png" alt="heart" />
          {c.bookmarks.length} responses
        </div>
      </div>
      <div className="ChallengeItemBody">
        <div>
          <h5 className="">{c.title}</h5>
          <div>Submitted by {c.owner.firstName} {c.owner.lastName}</div>
        </div>
        <div className="icon-lg"><ChevronRightIcon /></div>
      </div>
    </Link>
  )
}

const NoBookmarks = (props)=> {

  return (
    <div id="NoBookmarks" className="card border-dark mt-3">
      <div className="card-header"><h4>No Bookmarks Found</h4></div>
      <div className="card-body">
        <p className="card-text">
          You do not have any responses bookmarked. You can add bookmarks while
          reading responses from the challenge review screen.
        </p>
      </div>
    </div>
  );
}

export default BookmarkScreen;
