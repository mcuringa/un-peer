import React from 'react';
import {Link} from 'react-router-dom';
import _ from "lodash";

import df from "../DateUtil.js";
import db from "../DBTools.js";
import UserDB from "../users/UserDB.js";


import {ChallengeDB} from "./Challenge.js";
import ChallengeHeader from "./ChallengeHeader.js";

import {StarIcon, ChevronLeftIcon, ChevronDownIcon, BookmarkIcon} from 'react-octicons';
import { Video } from "../FormUtil";
import Modal from "../Modal";
import LoadingModal from "../LoadingModal";
import {LoadingSpinner} from "../FormUtil";

class ChallengeReviewScreen extends React.Component {
  constructor(props) {
    super(props);

    this.challengeId = this.props.match.params.id;

    this.state = {
      loadingChallenge: true,
      loadingResponses: true,
      loading: false,
      challenge: {},
      responses: [],
      bookmarks: [],
      isOwner: false,
      isProfessor: false
    };

    this.earlyAccess = this.props.user.admin;

    this.toggleBookmark = _.bind(this.toggleBookmark, this);
    this.isLoading = this.isLoading.bind(this);
  }

  componentWillMount() {

    ChallengeDB.get(this.challengeId)
      .then((c)=> { 

        this.setState({
          challenge: c, 
          loadingChallenge: false,
          isOwner: c.owner.uid == this.props.user.uid,
          isProfessor: c.professor && c.professor.uid == this.props.user.uid
        }); 

      });

    ChallengeDB.getResponses(this.challengeId).then((t)=>{
      this.setState({responses: t, loadingResponses: false});
    });

    const path = `/users/${this.props.user.uid}/bookmarks`;
    db.findAll(path).then((bookmarks)=>{
      const t = _.keyBy(bookmarks, (b)=>{return b.id});
      this.setState({bookmarks: t});
    });

  }

  isLoading() {
    return this.state.loadingChallenge || this.state.loadingResponses;
  }

  toggleBookmark(response) {
    const c = this.state.challenge;
    const uid = this.props.user.uid;
    let bookmarks = this.state.bookmarks;

    const updateState = ()=> {
      bookmarks[response.id] = !bookmarks[response.id];    
      this.setState({bookmarks: bookmarks});
    };

    if(bookmarks[response.id]) {
      db.delete(`/users/${uid}/bookmarks`, response.id).then(updateState);
    }
    else {
      UserDB.addBookmark(uid, response, c).then(updateState);
    }
  }

// <svg>
//     <linearGradient id="grad" x1="0" x2="0" y1="0" y2="100%">
//         <stop offset="50%" stop-color="grey"/>
//         <stop offset="50%" stop-color="white"/>
//     </linearGradient>
// </svg>

  render() {
    if(this.isLoading())
      return <LoadingModal status="Loading responses" show={true} />

    if(new Date() < this.state.challenge.ratingDue && !(this.state.isOwner || this.state.isProfessor))
      return (<TooEarly challenge={this.state.challenge} />);

    const makeToggleFunction = (r)=> {
      const f = ()=> {
        this.toggleBookmark(r);
      };
      return f;
    }

    let ResponseList = _.map(this.state.responses, (r, i)=>{

      return (
        <Response 
          response={r} 
          keyIndex={i}
          key={`resp_${i}`}
          user={this.props.user} 
          challenge={this.state.challenge}
          toggleBookmark={makeToggleFunction(r)} 
          bookmarked={this.state.bookmarks[r.id]}/>
      );
    });

    return (
      <div className="ResponseReviewScreen screen">
        <ChallengeHeader challenge={this.state.challenge} 
          owner={this.state.challenge.owner} 
          user={this.props.user} />
       
        <Link className="text-dark mb-2"
          to={`/challenge/${this.state.challenge.id}`}>
          <ChevronLeftIcon className="icon-dark pt-1 mr-1" />Back</Link>

        <WelcomeMsg 
          challenge={this.state.challenge}
          isOwner={this.state.isOwner} 
          isProfessor={this.state.isProfessor} />
        
        {ResponseList}
      
      </div>
    );
  }
}

const WelcomeMsg = (props) => {

  const title = (props.isOwner)?"owner of":"professor for";
  if(props.isOwner || props.isProfessor) {
    return (
      <div>
         <p className="text-muted pl-3 pr-3">
          As the {title} this challenge, please review the responses as
          they become available. After you are satisfied with your study,
          click the <span className="badge badge-secondary">feature</span> button
          to choose the response you would like to feature.
        </p>
        <p className="text-muted pl-3 pr-3">
          All responses to this challenge will be
          completed by <strong>{df.day(props.challenge.ratingsDue)}</strong>.
        </p>
      </div>
    );
  }
  return null;


}


const Bookmark = (props) => {

  const fillClass = (props.bookmarked)?"icon-primary":"icon-secondary";

  return(
    <div className={`clickable ${fillClass}`} onClick={props.toggleBookmark}>
      <BookmarkIcon />
    </div>
  );
}

const ToggleIcon = (props) => {
  return <ChevronDownIcon className="icon-secondary pt-1" />
}


const Response = (props) => {

    const r = props.response;
    return (
      <div className="card">
        <div className="card-header" id={`head_${props.keyIndex}`}>

            <div className="row">
                <div className="col-6 clickable" data-toggle="collapse" 
                  data-target={`#body_${props.keyIndex}`}>
                  <em>{r.title}</em>
                </div>
                <div className="col-4 clickable" data-toggle="collapse" 
                  data-target={`#body_${props.keyIndex}`}>
                  <StarRatings 
                    challengeId={props.challenge.id} 
                    rating={r.avgRating} 
                    user={props.user} 
                    responseId={r.id} />
                </div>
                <div className="col-1 clickable" data-toggle="collapse" 
                  data-target={`#body_${props.keyIndex}`}>
                  <ToggleIcon open={r.open} />
                </div>
                <div className="col-1">
                  <Bookmark {...props} />
                </div>
            </div>



        </div>
        <div id={`body_${props.keyIndex}`} className="collapse" data-parent="#ResponseList">
          <div className="card-body">
            <Video video={r.video} />
            {r.text}
          </div>
        </div>
      </div>

    );
}



const StarRatings = (props)=>{
  const stars = _.map([,,,,,], (n, i, t)=>{
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
  const fill = (props.val<=props.rating)?"filled":"";

  return (
    <div className={`Star ${fill}`}><StarIcon /></div>
    );
}


const TooEarly = (props)=> {

  return (
    <div id="TooEarly" className="card border-dark mt-3">
      <div className="card-header"><h4>Review not available</h4></div>
      <div className="card-body">
        <p className="card-text">
          Responses are not available yet for this challenge.
          The professor video and responses will be available
          on <strong>{df.day(props.challenge.ratingsDue)}</strong>.
        </p>
      </div>
      <div className="card-footer">
        <Link className="btn btn-secondary mr-2"
          to={`/challenge/${props.challenge.id}`}>View Challenge</Link>
        <Link className="btn btn-secondary"
          to="/">Go Home</Link>
      </div>
    </div>
  );
}



export default ChallengeReviewScreen;
