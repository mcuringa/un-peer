import React from 'react';
import _ from "lodash";
import {ChallengeDB} from "./Challenge.js";
import {StarIcon} from 'react-octicons';
import { Video } from "../FormUtil";
import LoadingModal from "../LoadingModal";
import LoadingModal from "../LoadingModal";



class ResponseList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {responses: [], loading: true};
    this.toggle = this.toggle.bind(this);
  }
  
  componentWillMount() {
    ChallengeDB.getResponses(this.props.challenge.id).then(
      (responses)=>{
        let t = _.map(responses,(r)=>{r.open = false; return r;});
        this.setState({responses: t, loading: false});
      }
    );
  }

  toggle(e) {
    let t = _.map(this.state.responses,(r)=>{
      r.open = r.id === e.target.id;
      return r;
    });
    this.setState({responses: t})

  }

  render() {

  if(this.state.loading)
    return <LoadingModal show={true} msg="loading responses" />


    let keyCount = 0;
    let responseItems = this.state.responses.map((r)=>{
      keyCount++;
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

      return (
        <div className="card">
          <div className="card-header" id={`head_${keyCount}`} key={`resp_${keyCount}`}>
            <div className="d-flex">
              <button className="btn btn-link text-dark" data-toggle="collapse" 
                data-target={`#body_${keyCount}`}>
                <em>Response {letters[keyCount-1]}</em>
              </button>
              <StarRatings challengeId={this.props.challengeId} user={this.props.user} response={r} />
            </div>
          </div>
          <div id={`body_${keyCount}`} className="collapse" data-parent="#ResponseList">
            <div className="card-body">
              <Video video={r.video} />
              {r.text}
            </div>
          </div>
        </div>

      );
    });

    return (
      <div id="ResponseList" className="ResponseList">
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

export default ResponseList;
