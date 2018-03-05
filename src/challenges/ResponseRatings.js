import React from 'react';
import {Link} from 'react-router-dom';
import _ from "lodash";
import df from "../DateUtil.js";
import {ChallengeDB} from "./Challenge.js";
import ChallengeHeader from "./ChallengeHeader.js";

import {StarIcon, DashIcon, PlusIcon, ChevronLeftIcon} from 'react-octicons';
import { Video } from "../FormUtil";
import Modal from "../Modal";
import LoadingModal from "../LoadingModal";
import {LoadingSpinner} from "../FormUtil";

class ResponseRatings extends React.Component {
  constructor(props) {
    super(props);

    this.challengeId = this.props.match.params.id;

    this.state = {
      loadingChallenge: true,
      loadingResponses: true,
      loading: false,
      challenge: {},
      showThankYou: false,
      thankYouShown: false
    };
    this.loadAssignments = this.loadAssignments.bind(this);
    this.isLoading = this.isLoading.bind(this);
    this.countRatings = this.countRatings.bind(this);
  }

  componentWillMount() {

    ChallengeDB.get(this.challengeId)
      .then(ChallengeDB.assignRatings)
      .then((c)=> { this.setState({challenge: c, loadingChallenge: false}); });

    ChallengeDB.getResponses(this.challengeId).then((t)=>{
      this.setState({responses: t, loadingResponses: false});
    });
  }

  isLoading() {
    return this.state.loadingChallenge || this.state.loadingResponses;
  }

  loadAssignments() {
    const c = this.state.challenge;

    const uid = this.props.user.uid;
    const assignIds = c.assignments[uid];
    let t = _.filter(this.state.responses, r=>_.includes(assignIds,r.id));
    
    t =_.map(t,(r)=>{r.open = false; return r;});
    
    return t;
  }

  countRatings() {
    const ratings = _.map(this.loadAssignments(), r=>_.keys(r.ratings));
    const raterIds = _.flatten(ratings);
    const count = _.reduce(raterIds, (n,id)=>{
      if(window.parseInt(id, 10) === window.parseInt(this.props.user.uid, 10))
        return n + 1;
      return n;
    }, 0);

    return count;
  }

  render() {

    if(this.isLoading())
      return <LoadingModal status="Loading assignments" show={true} />

    if(new Date() < this.state.challenge.responseDue)
      return (<TooEarly challenge={this.state.challenge} />);

    let assignments = this.loadAssignments();

    if(_.size(assignments)===0)
      return (<SorryMsg challenge={this.state.challenge} />);


    const makeValFunction = (r, i)=> {
      const f = (val)=> {
        const oldCount =  this.countRatings();
        
        const updateResponseState = (savedResponse)=> {
          let t = this.state.responses;
          t[i] = savedResponse;
          this.setState({responses: t, loading: false });
          const newCount = this.countRatings();
          if(oldCount === 2 && newCount === 3)
            this.setState({showThankYou: true});
        };

        this.setState({loading: true})
        r.ratings[this.props.user.uid] = val;
        ChallengeDB.addResponse(this.challengeId, r)
          .then(updateResponseState);
      }

      return f;
    }

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let ratingForms = assignments.map((r, i)=>{
      const rateF = makeValFunction(r,i);
      return (
        <ResponseRater 
          response={r} 
          keyIndex={i}
          key={`resp_${i}`}
          letter={letters[i]}
          user={this.props.user} 
          challenge={this.state.challenge}
          rateFunction={rateF} />
      );
    });

    return (

      <div className="ResponseList screen">
        <ChallengeHeader challenge={this.state.challenge} 
          owner={this.state.challenge.owner} 
          user={this.props.user} />

        <Link className="text-dark mb-2"
          to={`/challenge/${this.state.challenge.id}`}>
          <ChevronLeftIcon className="icon-dark pt-1 mr-1" />Back</Link>
        
        <Modal id="ratingsDone"
          show={this.state.showThankYou && !this.state.thankYouShown}
          closeHandler={()=>{this.setState({thankYouShown: true})}}
          title="★★Congratulations★★"
          body={`You have submitted all of your ratings. You are done! If you choose to, you can update your ratings while the rating period is still open. Ratings close on ${df.day(this.state.challenge.ratingsDue)}.`} />

        <div className="d-flex m-2 justify-content-end">
          <div className="badge badge-pill badge-secondary">
            <LoadingSpinner loading={this.state.loading} />
            {this.countRatings()} of 3 ratings submitted
          </div>
        </div>
        
        {ratingForms}
        <p className="text-muted ml-2 mr-2">Please review and rate each
           of the three responses below by clicking on the stars. After 
           you have rated each response you can click the button below to send your ratings.
        </p>
      </div>
    );
  }
}

const ToggleIcon = (props) => {
    if(props.open)
      return <DashIcon className="icon-secondary pt-1" />
    return <PlusIcon className="icon-secondary pt-1" />
}


const ResponseRater = (props) => {

    const r = props.response;
    let rating = 0;
    if(props.response.ratings && props.response.ratings[props.user.uid]){
      rating = props.response.ratings[props.user.uid];
    }

    return (
      <div className="card">
        <div className="card-header" id={`head_${props.keyIndex}`}>
          <button className="btn btn-link text-dark btn-block text-left" data-toggle="collapse" 
            data-target={`#body_${props.keyIndex}`}>
            <div className="row">
              <div className="col-11">
                <em>Response {props.letter}: {r.title}</em>
              </div>
              <div className="col-1"><ToggleIcon open={r.open} /></div>
            </div>
          </button>
          <StarRatings 
            challengeId={props.challenge.id} 
            rating={rating} 
            user={props.user} 
            responseId={r.id} 
            rateFunction={props.rateFunction} />
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
        rating={props.rating} 
        onClick={props.rateFunction} />
    );
  });

  return (
    <div className="bg-light">{stars}</div>
  );

}

const Star = (props)=> {
  const filled = (props.val<=props.rating)?"filled":"";
  const rate = ()=> {
    props.onClick(props.val);
  }
  return (
    <button className={`Star btn btn-link ${filled}`} onClick={rate}><StarIcon /></button>
    );
}


const TooEarly = (props)=> {

  return (
    <div id="SorryNotice" className="card border-dark mt-3">
      <div className="card-header"><h4>Ratings Still Open</h4></div>
      <div className="card-body">
        <p className="card-text">
          The response period for this challenge is still open.
          <strong>Please submit your response before {df.day(props.challenge.responseDue)}.</strong>
          You will be able to see all of the ratings
          after <em>{df.day(props.challenge.responseDue)}</em>.
        </p>
      </div>
      <div className="card-footer">
        <Link className="btn btn-secondary mr-2"
          to={`/challenge/${props.challenge.id}`}>View Challenge</Link>
        <Link className="btn btn-secondary mr-2"
          to={`/challenge/${props.challenge.id}/r`}>View Your Response</Link>
      </div>
    </div>
  );
}

const SorryMsg = (props)=> {

  return (
    <div id="SorryNotice" className="card border-dark mt-3">
      <div className="card-header"><h4>No Assignment</h4></div>
      <div className="card-body">
        <p className="card-text">
          You do not have rating assignments for this challenge.
          In order to rate responses you must submit a respone before
          the deadline. You will be able to see all of the ratings
          after <em>{df.day(props.challenge.ratingsDue)}</em>.
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



export default ResponseRatings;
