import React from 'react';
import {Link} from 'react-router-dom';
import _ from "lodash";

import df from "../DateUtil.js";
import db from "../DBTools.js";
import UserDB from "../users/UserDB.js";

import {ChallengeDB} from "./Challenge.js";
import ChallengeHeader from "./ChallengeHeader.js";

import {StarIcon, FlameIcon, ChevronDownIcon, ChevronRightIcon, BookmarkIcon} from 'react-octicons';
import { Video } from "../FormUtil";
import LoadingModal from "../LoadingModal";
import Snackbar from "../Snackbar";

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
      isProfessor: false,
      professorChoice: {},
      ownersChoice: {}
    };

    this.timeout = 1500;
    this.snack = _.bind(this.snack, this);
    this.clearSnack = _.bind(this.clearSnack, this);
    this.snack = _.throttle(this.snack, this.timeout + 200);

    this.earlyAccess = this.props.user.admin;
    this.toggleBookmark = _.bind(this.toggleBookmark, this);
    this.isLoading = this.isLoading.bind(this);
    this.featureResponse = this.featureResponse.bind(this);

  }

  snack(msg, undo) {
    this.setState({
      showSnack: true,
      snackMsg: msg,
      snackUndo: undo
    });
  }

  clearSnack() {
    this.setState({
      showSnack: false,
      snackMsg: "",
      snackUndo: null
    });
  }

  componentWillMount() {

    this.clearSnack();

    ChallengeDB.get(this.challengeId)
      .then((c)=> { 

        this.setState({
          challenge: c, 
          loadingChallenge: false,
          isOwner: c.owner.uid === this.props.user.uid,
          isProfessor: c.professor && c.professor.uid === this.props.user.uid
        }); 
      });

    db.findAll(`/challenges/${this.challengeId}/responses`).then((t)=>{
      this.setState({responses: t, loadingResponses: false});
    });

    const path = `/users/${this.props.user.uid}/bookmarks`;
    db.findAll(path).then((bookmarks)=>{
      let t = _.keyBy(bookmarks, (b)=>{return b.id});
      t = _.map(t, (b)=>{ return {[b.id]: true}; });
      this.setState({bookmarks: t});
    });

  }

  featureResponse(response) {
    let c = this.state.challenge;
    let msg = "";
    if(this.state.isProfessor){
      c.professorChoice = response;
      msg = "Professor's Choice saved";
    }
    else{
      c.ownerChoice = response;
      msg = "Owner's Choice saved";
    }
    
    ChallengeDB.save(c).then(()=>{
      this.setState({challenge: c});
      this.snack(msg);       
    });
  }

  isLoading() {
    return this.state.loadingChallenge || this.state.loadingResponses;
  }

  toggleBookmark(response) {
    const c = this.state.challenge;
    const uid = this.props.user.uid;
    let bookmarks = this.state.bookmarks;

    const exists = bookmarks[response.id];

    bookmarks[response.id] = !bookmarks[response.id];    
    this.setState({bookmarks: bookmarks});

    if(exists) {
      const msg = this.snack("bookmark deleted");
      const path = `/users/${uid}/bookmarks`;

      db.delete(path, response.id).then(msg);
    }
    else {
      const msg = this.snack("bookmark added");
      UserDB.addBookmark(uid, response, c).then(msg);
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

    // const profFeatId = this.state.challenge.professorChoice.id;
    const ownerFeatId = this.state.challenge.professorChoice.id;
    const filterFeatures = (r)=>{ return r.id !== ownerFeatId && r.id !== ownerFeatId };
    
    const responses = _.filter(this.state.responses, filterFeatures);

    let ResponseList = _.map(responses, (r, i)=>{

      return (
        <Response 
          response={r} 
          keyIndex={i}
          key={`resp_${i}`}
          user={this.props.user} 
          isOwner={this.state.isOwner}
          isProfessor={this.state.isProfessor}
          featureResponse={this.featureResponse}
          challenge={this.state.challenge}
          toggleBookmark={makeToggleFunction(r)} 
          bookmarked={this.state.bookmarks[r.id]} />
      );
    });


    return (
      <div className="ResponseReviewScreen screen">
        <ChallengeHeader challenge={this.state.challenge} 
          owner={this.state.challenge.owner} 
          user={this.props.user} />

        <WelcomeProfessor 
          challenge={this.state.challenge}
          isProfessor={this.state.isProfessor} />

        <WelcomeOwner 
          challenge={this.state.challenge}
          isOwner={this.state.isOwner} />

        <ProfessorResponse
          response={this.state.challenge.professorChoice}
          key="profRespKey"
          keyIndex="profRespKey"
          challenge={this.state.challenge}
          isProfessor={this.state.isProfessor} 
          isOwner={this.state.isOwner}
          bookmarked={this.state.bookmarks[this.state.challenge.professorChoice.id]}
          toggleBookmark={makeToggleFunction(this.state.challenge.professorChoice)} 
          user={this.props.user} 
        />

        {ResponseList}
        <Snackbar show={this.state.showSnack} 
          msg={this.state.snackMsg}
          wait={1500}
          onClose={this.clearSnack} />
      </div>
    );
  }
}


const ProfessorResponse = (props) => {


  return (
    <div>
      <Video 
        video={props.challenge.professorVideo}
        poster={props.challenge.professorPoster} />
      
      <div>
        <small><strong>Response from Professor {props.challenge.professor.lastName}</strong></small>
      </div>

      <Response
        open={true}
        response={props.response}
        challenge={props.challenge}
        keyIndex="profRespKey"
        key="profRespKey"
        user={props.response.user} 
        toggleBookmark={props.toggleBookmark} 
        bookmarked={props.bookmarked}
        profChoice={true}
      />
    </div>
  )
}


const WelcomeProfessor = (props) => {

  if(!props.isProfessor)
    return null;

  return (
    <div className="alert alert-secondary alert-dismissible fade show" role="alert">
      <strong>Welcome Professor</strong>
      <p>
        As the professor for this challenge, please review the responses as
        they become available. After you have chosen the response you would like to feature,
        click the <span className="badge badge-primary">★ set feature ★</span> button
        for that response.
      </p>
      <small>
        All responses to this challenge will be
        completed by <strong>{df.fullDay(props.challenge.ratingsDue)}</strong>.
      </small>
      <button type="button" className="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );
}

const WelcomeOwner = (props) => {
  

  if(!props.isOwner)
    return null;
  
  return (
    <div className="alert alert-secondary alert-dismissible fade show" role="alert">
      <strong>Welcome {props.user.firstName} {props.user.firstName}</strong>
      <p>
        As the owner of this challenge, please review the responses as
        they become available. After you are satisfied,
        click the <span className="badge badge-secondary">feature</span> button
        to choose the response you would like to feature.
      </p>
      <p>
        All responses to this challenge will be
        completed by <strong>{df.day(props.challenge.ratingsDue)}</strong>.
      </p>
    </div>
  );

}


const Bookmark = (props) => {

  const fillClass = (props.bookmarked)?"icon-primary":"icon-secondary";

  return(
    <div className={`clickable ${fillClass}`} onClick={props.toggleBookmark}>
      <BookmarkIcon />
    </div>
  );
}

class Response  extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: props.open}
  }

  render() {
    const r = this.props.response;
    const feature = ()=>{ this.props.featureResponse(r); };
    const toggleCss = (this.state.open)?"show":"";
    const ToggleIcon = (this.state.open)?(<ChevronDownIcon />):(<ChevronRightIcon />);
    
    const setToggle = () => {this.setState({open: !this.state.open})};

    const ProfFeature = ()=> {
      if(!this.props.profChoice)
        return null;

      return (
        <div className="badge badge-primary">
          <strong>Professor's Choice</strong>
          <div className="icon-light badge badge-primary ml-1"><FlameIcon /></div>
        </div>
      )  
    }

    const AuthorInfo = ()=> {
      if(!this.props.profChoice && !this.props.ownerChoice)
        return null;
      return (
        <p><small>Submitted by: {r.user.firstName} {r.user.lastName}</small></p>
      )
    }

    const FeatureButton = ()=>{
      if(!this.props.isProfessor && !this.props.isOwner)
        return null;

      return (
        <button 
          className="btn btn-sm btn-block btn-primary mb-2" 
          style={{marginTop:"-1rem"}}
          type="button"
          onClick={feature}>
          ★ set feature ★
        </button>
      )
    };
    return (
      <div className="card mb-3">
        <div 
          id={`head_${this.props.keyIndex}`}
          className="card-header" 
          aria-expanded={this.props.open}>
          <div className="row">
              <div className="col-5 clickable"
                onClick={setToggle}
                data-toggle="collapse" 
                data-target={`#body_${this.props.keyIndex}`}>
                <strong>{r.title}</strong>
                <ProfFeature />
              </div>
              <div className="col-5 clickable" data-toggle="collapse" 
                onClick={setToggle}
                data-target={`#body_${this.props.keyIndex}`}>
                <StarRatings 
                  rating={r.avgRating} 
                  user={this.props.user} 
                  responseId={r.id} />
              </div>
              <div className="col-1 clickable" data-toggle="collapse"
                onClick={setToggle} 
                data-target={`#body_${this.props.keyIndex}`}>
                {ToggleIcon}
              </div>
              <div className="col-1">
                <Bookmark {...this.props} />
              </div>
          </div>
        </div>
        <div id={`body_${this.props.keyIndex}`} className={toggleCss} data-parent="#ResponseList">
          <div className="card-body">
            <FeatureButton />
            <Video video={r.video} />
            <AuthorInfo />
            {r.text}
          </div>
        </div>
      </div>

    );
  }
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
