import React from 'react';
import _ from "lodash";

import df from "../DateUtil.js";
import db from "../DBTools.js";

import {ChevronDownIcon, ChevronUpIcon, ChevronLeftIcon} from 'react-octicons';
import { CalendarIcon, HeartIcon } from "../UNIcons";
import { Video } from "../FormUtil";
import LoadingModal from "../LoadingModal";
import {snack, SnackMaker} from "../Snackbar";
import {StarRatings} from "../StarRatings";


class BookmarkDetailScreen extends React.Component {
  constructor(props) {
    super(props);

    this.challengeId = this.props.match.params.id;

    this.state = {
      loading: true,
      bookmarks: [],
    };

    this.removeBookmark = _.bind(this.removeBookmark, this);
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
  }

  componentWillMount() {
    console.log("mounting bookmark detail");
    const setBookmarks = (bookmarks)=> {
      bookmarks = _.filter(bookmarks, b=>b.challengeId===this.challengeId);

      this.setState({bookmarks: bookmarks, loading: false});
    }

    if(!this.props.user.bookmarks) {
      const path = `/users/${this.props.user.uid}/bookmarks`;
      db.findAll(path).then(setBookmarks);
    }
    else {
      setBookmarks(this.props.user.bookmarks);
    }
  }

  removeBookmark(bookmark) {
    const id = bookmark.id;
    const uid = this.props.user.uid;
    let bookmarks = this.state.bookmarks;

    const updateUser = ()=> {
      let u = this.props.user;
      u.bookmarks = bookmarks;
      this.props.updateAppUser(u);
    }

    const deleteBookmark = ()=> {
      const path = `/users/${uid}/bookmarks`;
      const delMsg = ()=>{this.snack("bookmark deleted")};
      db.delete(path, id).then(delMsg);
      updateUser();
    };

    bookmarks = _.filter(bookmarks, b=>b.id !== id);
    deleteBookmark();
    this.setState({bookmarks: bookmarks});

    this.snack("deleting bookmark", false);
  }

  render() {
    console.log("rendering bookmarks", this.state.bookmarks);

    const makeChallenge = (t)=>{
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
      return c;
    }

    if(this.state.loading)
      return  (<LoadingModal status="Loading favourites..." show={true} />)

    
    const EmptyMsg = () => {
      return (
        <div className="alert alert-secondary m-3">
          No bookmarks found. <hr />
          <button onClick={this.props.history.goBack} className="btn btn-secondary">Back to my favourites.</button>
        </div>
      )
    }

    if(this.state.bookmarks.length === 0)
      return <EmptyMsg />


    const challenge = makeChallenge(this.state.bookmarks);
    let bookmarks = _.sortBy(this.state.bookmarks, "created");
    const blist = _.map(bookmarks, (b,i)=>{
      const delB = ()=>{this.removeBookmark(b)};
      return (
        <Bookmark 
          key={_.uniqueId("bookmark_")}
          keyIndex={i+1}
          bookmark={b}
          removeBookmark={delB}
          user={this.props.user} />)
    });

    return (
      <div className="ResponseReviewScreen screen p-0">
        <Challenge challenge={challenge} user={this.props.user} back={this.props.history.goBack} />
        {blist}
        <this.Snackbar />
      </div>
    );
  }
}


const Challenge =(props)=> {
  const c = props.challenge;
  return (
    <div className="StaticChallengeItem">
      <div className="ChallengeItemHeader">
        <div className="d-flex align-items-center">
          <button className="btn btn-link p-0" onClick={props.back}>
            <ChevronLeftIcon />
          </button>
          <div className="mr-2 ml-2"><CalendarIcon /></div>
          <div className="single-space">{df.range(c.start, c.end)}</div>
        </div>
        <div className="d-flex align-items-start">
          <HeartIcon />
          <div className="single-space pl-1">{c.bookmarks.length} responses</div>
        </div>
      </div>
      <div className="ChallengeItemBody">
        <div>
          <h5 className="">{c.title}</h5>
          <div>Submitted by {c.owner.firstName} {c.owner.lastName}</div>
        </div>
      </div>
    </div>
  )

}


const BookmarkButton = (props) => {

  return(
    <div className="d-flex justify-content-end mb-1">
      <button className={`btn btn-secondary btn-sm`} onClick={props.removeBookmark}>
        remove bookmark
      </button>
    </div>
  );
}

class Bookmark  extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: props.open}
  }

  render() {
    const toggleCss = (this.state.open)?"show":"collapse";
    const ToggleIcon = (this.state.open)?(<ChevronDownIcon />):(<ChevronUpIcon />);
    
    const setToggle = () => {this.setState({open: !this.state.open})};
    const b = this.props.bookmark;

    return (
      <div className="RatedResponse bg-white">
        <div id={`head_${this.props.keyIndex}`} 
          className="RatedResponseHeader"
          aria-expanded={this.props.open}>
            <div className="clickable"
              onClick={setToggle}
              data-toggle="collapse" 
              data-target={`#body_${this.props.keyIndex}`}>
              <strong>{b.title}</strong>
            </div>
            <div className="d-flex justify-content-end">
              <div className="clickable mr-2 pl-2" data-toggle="collapse" 
                onClick={setToggle}
                data-target={`#body_${this.props.keyIndex}`}>
                <StarRatings rating={b.avgRating} />
              </div>
              <div className="clickable mr-2" data-toggle="collapse"
                onClick={setToggle} 
                data-target={`#body_${this.props.keyIndex}`}>
                {ToggleIcon}
              </div>
          </div>
        </div>
        <div id={`body_${this.props.keyIndex}`} className={`RatedResponseBody ${toggleCss}`} data-parent="#ResponseList">
          <BookmarkButton removeBookmark={this.props.removeBookmark} />
          <Video video={b.video} />
          {b.text}
        </div>
      </div>

    );
  }
}

export default BookmarkDetailScreen;
