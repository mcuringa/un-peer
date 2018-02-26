import React from 'react';
import {Link} from 'react-router-dom';
import _ from "lodash";
import df from "../DateUtil.js";
import {ChallengeDB} from "./Challenge.js";
import {StarIcon, ChevronLeftIcon} from 'react-octicons';
import { Video } from "../FormUtil";

class ResponseRatings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {responses: []};
    this.toggle = this.toggle.bind(this);

  }
  
  componentWillMount() {
    const c = this.props.challenge;
    if(!c.assignments) {
      ChallengeDB.assignRatings(c).then((newC)=>{
        console.log("got assignments back from call");
        console.log(newC);
      });
    }


    ChallengeDB.getResponses(this.props.challenge.id).then(
      (responses)=>{
        const uid = this.props.user.uid;
        const assignIds = c.assignments[uid];
        console.log("found my assignments");
        console.log(assignIds);

        let t = _.filter(responses,r=>_.includes(assignIds,r.id));
        console.log("found my responses");
        console.log(t);
        t =_.map(t,(r)=>{r.open = false; return r;});

        
        this.setState({responses: t})
      }
    );
  }

  toggle(e) {
    let t = _.map(this.state.responses,(r)=>{
      r.open = r.id == e.target.id;
      return r;
    });
    this.setState({responses: t})

  }

  render() {
    let keyCount = 0;
    let responseItems = this.state.responses.map((r)=>{
      keyCount++;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      return (
        <div className="card">
          <div className="card-header" id={`head_${keyCount}`} key={`resp_${keyCount}`}>
            <div className="">
              <button className="btn btn-link text-dark btn-block text-left" data-toggle="collapse" 
                data-target={`#body_${keyCount}`}>
                <em>Response {letters[keyCount-1]}: {r.title}</em>
              </button>
              <StarRatings challengeId={this.props.challengeId} user={this.props.user} response={r} />
            </div>
          </div>
          <div id={`body_${keyCount}`} className="collapse" data-parent="#ResponseList">
            <div className="card-body">
              {r.title}
              <Video video={r.video} />
              {r.text}
            </div>
          </div>
        </div>

      );
    });

    return (
      <div id="ResponseList" className="ResponseList">
        <Link className="text-dark mb-2"
          to={`/challenge/${this.props.challengeId}`}>
          <ChevronLeftIcon className="icon-dark pt-1 mr-1" />Back</Link>
        {responseItems}
      </div>
    );
  }
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
  
  componentWillMount() {

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