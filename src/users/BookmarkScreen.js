import React from 'react';
import {Link} from 'react-router-dom';
import _ from "lodash";

// import df from "../DateUtil.js";
import db from "../DBTools.js";

import {StarIcon, ChevronDownIcon, ChevronRightIcon, TrashcanIcon, EyeIcon} from 'react-octicons';
import { Video } from "../FormUtil";
import LoadingModal from "../LoadingModal";
import Snackbar from "../Snackbar";

class BookmarkScreen extends React.Component {
  constructor(props) {
    super(props);

    this.challengeId = this.props.match.params.id;

    this.state = {
      loading: true,
      bookmarks: [],
    };

    this.timeout = 2500;
    this.snack = _.bind(this.snack, this);
    this.snack = _.throttle(this.snack, this.timeout + 200);
    this.removeBookmark = _.bind(this.removeBookmark, this);
  }

  snack(msg, showUndo) {

    const p = (resolve, reject)=>
    {
      const clear = ()=> {
        this.setState({
          showSnack: false,
          snackMsg: "",
          snackUndo: null
        });
      }
      const over = ()=> {
        clear();
        resolve();
      }

      const undo = ()=> {
        clear();
        reject();
      }

      this.setState({
        showSnack: true,
        snackMsg: msg,
        showUndo: showUndo,
        snackUndo: undo,
        snackOver: over
      });      
    }

    return new Promise(p);

  }

  componentWillMount() {

    const path = `/users/${this.props.user.uid}/bookmarks`;
    db.findAll(path).then((bookmarks)=>{
      let t = _.keyBy(bookmarks, (b)=>{return b.id});
      this.setState({bookmarks: t, loading: false});
    });

  }

  removeBookmark(id) {
    

    const uid = this.props.user.uid;
    let bookmarks = this.state.bookmarks;
    const oldBookmark = bookmarks[id];



    const undo = ()=> {
      console.log("restore called");
      bookmarks[id] = oldBookmark;
      this.setState(bookmarks: bookmarks);
      this.snack("bookmark restored");
    }

    const deleteBookmark = ()=> {
      const path = `/users/${uid}/bookmarks`;
      const delMsg = ()=>{this.snack("bookmark deleted")};
      db.delete(path, id).then(delMsg);
    };

    delete bookmarks[id];
    this.setState({bookmarks: bookmarks});

    this.snack("deleting bookmark", true).then(deleteBookmark, undo);
    

  }

  render() {
    if(this.state.loading)
      return <LoadingModal status="Loading bookmarks" show={true} />


    if(this.state.bookmarks.length === 0)
      return <NoBookmarks />

    const makeDelF = (b)=> {
      const f = ()=> {
        this.removeBookmark(b.id);
      };
      return f;
    }
    
    let bookmarks = _.values(this.state.bookmarks);
    bookmarks = _.sortBy(bookmarks, b=>b.created);
    let BookmarkList = _.map(bookmarks, (b, i)=>{
      return (
        <Bookmark 
          bookmark={b} 
          keyIndex={i}
          key={`bookmark_${i}`}
          user={this.props.user} 
          removeBookmark={makeDelF(b)} 
          open={false} />
      );
    });

    return (
      <div className="ResponseReviewScreen screen">
        <StarGradient />
        {BookmarkList}
        <Snackbar show={this.state.showSnack} 
          msg={this.state.snackMsg}
          showUndo={this.state.showUndo}
          undo={this.state.snackUndo}
          onClose={this.state.snackOver} />
      </div>
    );
  }
}


const BookmarkButton = (props) => {

  return(
    <div className={`clickable icon-secondary`} onClick={props.removeBookmark}>
      <TrashcanIcon />
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
    const ToggleIcon = (this.state.open)?(<ChevronDownIcon />):(<ChevronRightIcon />);
    
    const setToggle = () => {this.setState({open: !this.state.open})};
    const b = this.props.bookmark;

    return (
      <div className="card mb-3">
        <div id={`head_${this.props.keyIndex}`} className="card-header" aria-expanded={this.props.open}>
          <div className="row">
            <div className="col-5 clickable"
              onClick={setToggle}
              data-toggle="collapse" 
              data-target={`#body_${this.props.keyIndex}`}>
              <strong>{b.title}</strong>
            </div>
            <div className="col-5 clickable" data-toggle="collapse" 
              onClick={setToggle}
              data-target={`#body_${this.props.keyIndex}`}>
              <StarRatings rating={b.avgRating} />
            </div>
            <div className="col-1 clickable" data-toggle="collapse"
              onClick={setToggle} 
              data-target={`#body_${this.props.keyIndex}`}>
              {ToggleIcon}
            </div>
            <div className="col-1">
              <BookmarkButton removeBookmark={this.props.removeBookmark} />
            </div>
          </div>
         </div>
        <div id={`body_${this.props.keyIndex}`} className={toggleCss} data-parent="#ResponseList">
          <div className="card-body">
            <h3 className="text-muted d-flex justify-content-between">{b.challengeTitle}
              <Link to={`/challenge/${b.challengeId}`} className="p1-1 icon-primary" title="view challenge"><EyeIcon /></Link>
            </h3>
            <div><small><strong>{b.title}</strong></small></div>
            <Video video={b.video} />
            {b.text}
          </div>
        </div>
      </div>

    );
  }
}

const StarGradient = (props)=> {
  const angles = {
    x1:"0%",
    y1:"50%",
    x2:"100%",
    y2:"50%"
  }
  return (
    <div style={{height: 0}}>
    <svg>
      <linearGradient id="QuarterFull" {...angles}>
        <stop offset="40%" stopColor="#6c757d"/>
        <stop offset="40%" stopColor="white"/>
      </linearGradient>
      <linearGradient id="HalfFull" {...angles}>
        <stop offset="50%" stopColor="#6c757d"/>
        <stop offset="50%" stopColor="white"/>
      </linearGradient>
      <linearGradient id="ThreeQuartersFull" {...angles}>
        <stop offset="60%" stopColor="#6c757d"/>
        <stop offset="60%" stopColor="white"/>
      </linearGradient>

    </svg>
    </div>
  )

}

const StarRatings = (props)=>{

  const stars = _.map([true,true,true,true,true], (n, i, t)=>{
    return (
      <Star key={`star_${props.responseId}_${i}`} 
        val={i+1} 
        rating={props.rating} />
    );
  });

  return (
    <div className="bg-light d-flex justify-content-between">{stars}</div>
  );

}

const Star = (props)=> {

  const fillStyle = (v, rating)=> {
    if(!rating)
      return "not-rated";

    const roundToQuartile = (n)=> {
      n = Math.round(n*4)/4;
      return _.round(n,2);
    }

    rating = roundToQuartile(rating);
    const pct = rating - Math.floor(rating);

    if(props.val < Math.floor(rating))
      return "filled";
    
    if(props.val > rating)
      return "";


    if(pct === .25)
      return "quarter";
    if(pct === .50)
      return "half";
    if(pct === .75)
      return "three-quarters";

    return "filled";
  }

  let fill = fillStyle(props.val, props.rating);

  return (
    <div className={`Star ${fill}`}><StarIcon /></div>
    );
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
