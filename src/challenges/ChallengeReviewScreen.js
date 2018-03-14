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
      ownerChoice: {}
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
      
      let bookmarks = _.keyBy(t, (r)=>{return r.id});
      _.each(_.keys(bookmarks), (k)=>{bookmarks[k] = false});

      const path = `/users/${this.props.user.uid}/bookmarks`;
      db.findAll(path).then((t)=> {
        _.each(t, (b)=>{
          bookmarks[b.id] = true;
        });

        this.setState({bookmarks: bookmarks});
      });

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

  render() {
    if(this.isLoading())
      return <LoadingModal status="Loading responses" show={true} />

    if(new Date() < this.state.challenge.ratingDue && !(this.state.isOwner || this.state.isProfessor ||this.props.user.su))
      return (
        <div className="ResponseReviewScreen screen">
          <ChallengeHeader challenge={this.state.challenge} 
            screenTitle="Challenge Review"
            owner={this.state.challenge.owner} 
            user={this.props.user} />
            <TooEarly challenge={this.state.challenge} />
        </div>
      );

    const makeToggleFunction = (r)=> {
      const f = ()=> {
        this.toggleBookmark(r);
      };
      return f;
    }

    const profFeatId = this.state.professorChoice.id || "";
    const ownerFeatId = this.state.ownerChoice.id || "";
    const filterFeatures = (r)=>{ return r.id !== profFeatId && r.id !== ownerFeatId };
    
    let responses = _.filter(this.state.responses, filterFeatures);
    responses = _.reverse(_.sortBy(responses, r=>r.avgRating||-1));
    const highestRating = responses[0].avgRating;
    responses = _.map(responses, (r)=> {
      if(r.avgRating === highestRating)
        r.topRated = true;
      return r;
    });


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
          open={false}
          bookmarked={this.state.bookmarks[r.id]} />
      );
    });


    return (
      <div className="ResponseReviewScreen screen">
        <StarGradient />
        <ChallengeHeader challenge={this.state.challenge} 
          screenTitle="Challenge Review"
          owner={this.state.challenge.owner} 
          user={this.props.user} />

        <WelcomeProfessor 
          challenge={this.state.challenge}
          isProfessor={this.state.isProfessor} />

        <WelcomeOwner 
          challenge={this.state.challenge}
          isOwner={this.state.isOwner} 
          user={this.props.user} />

        <ProfessorResponse
          response={this.state.challenge.professorChoice}
          key="profRespKey"
          keyIndex="profRespKey"
          challenge={this.state.challenge}
          isProfessor={this.state.isProfessor} 
          isOwner={this.state.isOwner}
          bookmarked={this.state.bookmarks[this.state.professorChoice.id]}
          toggleBookmark={makeToggleFunction(this.state.challenge.professorChoice)} 
          user={this.props.user} 
        />

        <Response
          open={true}
          response={this.state.challenge.ownerChoice}
          challenge={this.state.challenge}
          key="ownerResponseKey"
          keyIndex="ownerResponseKey"
          user={this.props.user} 
          toggleBookmark={makeToggleFunction(this.state.challenge.ownerChoice)} 
          bookmarked={this.state.bookmarks[this.state.ownerChoice.id]}
          ownerChoice={true}
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
        user={props.user} 
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
      <strong>Welcome {props.user.firstName}</strong>
      <p>
        As the creator of this challenge, please review the responses as
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
    if(!r)
      return null;

    const feature = ()=>{ this.props.featureResponse(r); };
    const toggleCss = (this.state.open)?"show":"collapse";
    const ToggleIcon = (this.state.open)?(<ChevronDownIcon />):(<ChevronRightIcon />);
    
    const setToggle = () => {this.setState({open: !this.state.open})};

    const ProfFeature = ()=> {
      if(!this.props.profChoice)
        return null;

      return (
        <div className="badge badge-primary">
          <div className="icon-light badge badge-primary ml-1"><FlameIcon /></div>
          <strong>Professor's Choice</strong>
        </div>
      )  
    }

    const OwnerFeature = ()=> {
      if(!this.props.ownerChoice)
        return null;

      return (
        <div className="d-flex align-content-center badge badge-primary">
          <div className="icon-light mr-1"><FlagIcon /></div>
          <div style={{fontSize: "18px", lineHeight: "32px"}}>Owner's Choice</div>
        </div>
      )  
    }


    const TopRated = ()=> {
      if(!r.topRated)
        return null;

      return (
        <div className="d-flex align-content-center badge badge-primary">
          <div className="p-1 mr-1"><img src="/img/CircleStar.svg" style={{width:"24px"}} alt="star icon" /></div>
          <div style={{fontSize: "20px", lineHeight: "32px"}}>Top Ranked</div>
        </div>
      )  
    }


    const AuthorInfo = ()=> {
      if(!this.props.profChoice && !this.props.ownerChoice && !r.topRated)
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
        <div id={`head_${this.props.keyIndex}`} className="card-header" aria-expanded={this.props.open}>
          <div className="row">
            <div className="col-5 clickable"
              onClick={setToggle}
              data-toggle="collapse" 
              data-target={`#body_${this.props.keyIndex}`}>
              <strong>{r.title}</strong>
            </div>
            <div className="col-5 clickable" data-toggle="collapse" 
              onClick={setToggle}
              data-target={`#body_${this.props.keyIndex}`}>
              <StarRatings rating={r.avgRating} />
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
          <div className="d-flex flex-row-reverse">
            <ProfFeature />
            <OwnerFeature />
            <TopRated />
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
      <pattern id="UnratedHash" patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M-1,1 l2,-2
                 M0,4 l4,-4
                 M3,5 l2,-2" 
              style={{stroke:"black", strokeWidth:1}} />
      </pattern>
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

const FlagIcon = (props)=> {
  return (
    <svg height="32px" width="32px" className="pt-2 pl-2">
      <g transform="scale(.65)">
        <rect fill="white" width="4" height="32" x="0" y="0" />
        <rect fill="white" width="19" height="19" x="0" y="0" />
        <rect fill="white" width="14" height="18" x="16" y="4" />
      </g>
    </svg>
  )
}

export default ChallengeReviewScreen;
