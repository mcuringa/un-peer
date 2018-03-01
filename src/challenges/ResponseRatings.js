import React from 'react';
import {Link} from 'react-router-dom';
import _ from "lodash";
import df from "../DateUtil.js";
import {ChallengeDB} from "./Challenge.js";
import {StarIcon, DashIcon, PlusIcon, ChevronLeftIcon} from 'react-octicons';
import { Video } from "../FormUtil";
import Modal from "../Modal";
import {LoadingSpinner} from "../FormUtil";

class ResponseRatings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: [], loading: true};
    this.loadAssignments = this.loadAssignments.bind(this);
    this.submitRatings = this.submitRatings.bind(this);
  }
  
  loadAssignments() {
    const c = this.props.challenge;
    if(!c.assignments)
      return [];
    const uid = this.props.user.uid;
    const assignIds = c.assignments[uid];
    let t = _.filter(this.props.responses,r=>_.includes(assignIds,r.id));
    
    t =_.map(t,(r)=>{r.open = false; return r;});
    
    return t;
  }

  submitRatings() {
    console.log("submitting ratings");
  }

  render() {

    let assignments = this.loadAssignments();
    if(_.size(assignments)==0 && !this.state.loading)
      return (<SorryMsg challenge={this.props.challenge} />);

    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    let ratingForms = assignments.map((r, key)=>{
      return (
        <ResponseRater 
          response={r} 
          keyIndex={key} letter={letters[key]}
          user={this.props.user} 
          challenge={this.props.challenge} />
      );
    });

    return (
      <div id="ResponseList" className="ResponseList">
        <Modal id="confirmRatings"
          onConfirm={this.submitRatings}
          confirmLabel="Submit Ratings"
          body="Are you sure you want to send your ratings? Once sent, they cannot be changed." />

        <Link className="text-dark mb-2"
          to={`/challenge/${this.props.challenge.id}`}>
          <ChevronLeftIcon className="icon-dark pt-1 mr-1" />Back</Link>
        <p>
          Please review and rate each of the three responses below by clicking on the stars.
          After you have rated each response you can click the button below to send your ratings.
        </p>
        <button className="btn btn-block btn-secondary mb-2"
          data-toggle="modal" data-target="#confirmRatings">
          Submit my ratings
        </button>
        {ratingForms}
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
    console.log("props.keyIndex");
    console.log(props.keyIndex);

    return (
      <div className="card">
        <div className="card-header" id={`head_${props.keyIndex}`} key={`resp_${props.keyIndex}`}>
          <button className="btn btn-link text-dark btn-block text-left" data-toggle="collapse" 
            data-target={`#body_${props.keyIndex}`}>
            <div className="row">
              <div className="col-11">
                <em>Response {props.letter}: {r.title}</em>
              </div>
              <div className="col-1"><ToggleIcon open={r.open} /></div>
            </div>
          </button>
          <StarRatings challengeId={props.challenge.id} user={props.user} response={r} />
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


const SorryMsg = (props)=> {

  return (
    <div id="SorryNotice" className="card border-dark">
      <div className="card-header"><h4>No Assignments</h4></div>
      <div className="card-body">
        <p class="card-text">
          You do not have rating assignments for this challenge.
          In order to rate responses you must submit a respone before
          the deadline. You will be able to see all of the ratings
          after {df.day(props.challenge.ratingsDue)}.
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


class StarRatings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rating: this.props.response.avgRating,
      response: this.props.response
    };
    this.rate = this.rate.bind(this);
  }
  
  rate(val) {
    this.setState({rating: val});
    let r = this.state.response;
    r.ratings[this.props.user.uid] = val;
    console.log("updating rating");
    console.log(this.props.challengeId);
    console.log(this.state.response);
    // console.log("updating rating");
    ChallengeDB.addResponse(this.props.challengeId, this.state.response)
    .then((r)=>{
      console.log("rating added");
      this.setState({response: r });
    });
  }

  render() {
    let stars = [];
    for(let val=1;val<=5;val++)
      stars.push(
        <Star key={`star_${this.props.responseId}_${val}`} 
              val={val} 
              rating={this.state.rating} 
              onClick={this.rate} />)

    return (
      <div className="bg-light">{stars}</div>
    );

  }

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

export default ResponseRatings;