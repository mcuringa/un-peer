import React from 'react';
import {Link} from 'react-router-dom';
import _ from "lodash";

import df from "../DateUtil.js";
import db from "../DBTools.js";
import UserDB from "../users/UserDB.js";

import {ChallengeDB} from "./Challenge.js";
import ChallengeHeader from "./ChallengeHeader.js";

import { Video } from "../FormUtil";
import LoadingModal from "../LoadingModal";
import Snackbar from "../Snackbar";

import Response from "./Response"

class ChallengeReviewScreen extends React.Component {
  constructor(props) {
    super(props);

    this.challengeId = this.props.match.params.id;
    let hash = window.decodeURIComponent(window.location.hash);
    if(hash && hash.length>0)
      hash = hash.slice(1);

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
      ownerChoice: {},
      targetResponseId: hash
    };

    this.timeout = 1500;
    this.snack = _.bind(this.snack, this);
    this.clearSnack = _.bind(this.clearSnack, this);
    this.snack = _.throttle(this.snack, this.timeout + 200);

    this.earlyAccess = this.props.user.admin;
    this.toggleBookmark = _.bind(this.toggleBookmark, this);
    this.isLoading = this.isLoading.bind(this);
    this.setProfChoice = this.setProfChoice.bind(this);
    this.setOwnerChoice = this.setOwnerChoice.bind(this);

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
        const empty = {firstName:"", lastName:"", uid: 0, email:""}
        if(!c.owner)
          c.owner = empty;
        if(!c.professor)
          c.professor = empty;

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

  setOwnerChoice(response) {
    let c = this.state.challenge;
    const msg = "Owner's Choice saved";
    c.ownerChoice = response;
    
    ChallengeDB.save(c).then(()=>{
      this.setState({challenge: c});
      this.snack(msg);       
    });
  }

  setProfChoice(response) {
    let c = this.state.challenge;
    const msg = "Expert's Choice saved";
    c.professorChoice = response;
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

      let u = this.props.user;
      let t = _.filter(u.bookmarks, b=>b.id!==response.id);
      u.bookmarks = t;
      this.props.updateAppUser(u);

      db.delete(path, response.id).then(msg);
    }
    else {
      UserDB.addBookmark(uid, response, c).then((b)=>{
        this.snack("bookmark added");
  
        let u = this.props.user;
        u.bookmarks = _.concat(u.bookmarks, b);
        this.props.updateAppUser(u);

      });
    }
  }

  componentDidUpdate() {
    const hash = window.decodeURIComponent(window.location.hash);
    if(!hash || !hash.length>0)
      return;

    const target = document.querySelector(`${hash}`);
    if(target)
      target.scrollIntoView();
  }

  render() {
    if(this.isLoading())
      return <LoadingModal status="Loading responses" show={true} />

    if(new Date() < this.state.challenge.ratingDue && !(this.state.isOwner || this.state.isProfessor ||this.props.user.su))
      return (
        <div className="ResponseReviewScreen screen">
          <ChallengeHeader 
            challenge={this.state.challenge} 
            history={this.props.history}
            screenTitle="Challenge Review"
            owner={this.state.challenge.owner} 
            user={this.props.user} />
            <TooEarly challenge={this.state.challenge} />
        </div>
      );

    const makeToggleFunction = (r)=> {
      const f = (e)=> {
        e.preventDefault();
        this.toggleBookmark(r);
      };
      return f;
    }

    const compProf = (a,b)=>{
      if(a.profChoice && !b.profChoice)
        return -1;

      if(b.profChoice && !a.profChoice)
        return 1;

      return 0;
    }

    const compOwner = (a,b)=>{
      if(a.ownerChoice && !b.ownerChoice)
        return -1;

      if(b.ownerChoice && !a.ownerChoice)
        return 1;

      return 0;
    }

    const highestRatingEarliestDateComp = (a, b)=>{
      const p = compProf(a,b);
      if(p)
        return p;

      const o = compOwner(a,b);
      if(o)
        return o;

      if (a.avgRating < b.avgRating) {
        return 1;
      }
      if (a.avgRating > b.avgRating) {
        return -1;
      }

      if (a.created < b.created) {
        return -1;
      }
      if (a.created > b.created) {
        return 1;
      }
      return 0;
    }

    const ownerFeatId = (this.state.challenge.ownerChoice)?this.state.challenge.ownerChoice.id : "";
    const profFeatId = (this.state.challenge.professorChoice)?this.state.challenge.professorChoice.id : "";

    let responses = _.map(this.state.responses, (r)=> {
      r.avgRating = r.avgRating||0;
      r.ownerChoice = (r.id === ownerFeatId);
      r.profChoice = (r.id === profFeatId);
      return r;
    });

    responses.sort(highestRatingEarliestDateComp);

    // const highestRating = responses[0].avgRating;
    // responses = _.map(responses, (r)=> {
    //   r.topRated = (r.avgRating === highestRating);
    //   return r;
    // });


    let ResponseList = _.map(responses, (r, i)=>{

      return (
        <Response 
          key={_.uniqueId("resp_")}
          challenge={this.state.challenge}
          response={r} 
          profChoice={r.profChoice}
          ownerChoice={r.ownerChoice}
          open={r.profChoice || r.ownerChoice || r.id === this.state.targetResponseId}
          user={this.props.user}
          isOwner={this.state.isOwner}
          isProfessor={this.state.isProfessor}
          toggleBookmark={makeToggleFunction(r)} 
          targetResponseId={this.state.targetResponseId}
          bookmarked={this.state.bookmarks[r.id]}
          editable={true}
          bookmarkable={true}
          setOwnerChoice={this.setOwnerChoice}
          setProfChoice={this.setProfChoice} />

      );
    });


    return (
      <div className="ResponseReviewScreen screen">

        <ChallengeHeader challenge={this.state.challenge} 
          history={this.props.history}
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

        <Video 
          video={this.state.challenge.professorVideo}
          poster={this.state.challenge.professorPoster} />
        
        <blockquote className="blockquote">
          <p className="mb-0">{this.state.challenge.professorResponse}</p>
          <footer className="blockquote-footer text-right">Professor {this.state.challenge.professor.lastName}</footer>
        </blockquote>

        {ResponseList}
        <Snackbar show={this.state.showSnack} 
          msg={this.state.snackMsg}
          wait={1500}
          onClose={this.clearSnack} />
      </div>
    );
  }
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
        click the <span className="badge badge-sm badge-secondary">
          Make expert's choice
        </span> button
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
        click the <span className="badge badge-sm badge-secondary">
          Make owners's choice
        </span> button for that response.
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
          to="/">Home</Link>
      </div>
    </div>
  );
}



export default ChallengeReviewScreen;
