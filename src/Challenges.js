import React from 'react';
import { Link } from 'react-router-dom'
import "./Challenges.css";
import ChallengeDB from "./ChallengeDB";

class ChallengeListScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenges: ChallengeDB.findAll()};
  }
  render() {
    const t = this.state.challenges.map((challenge) => 
      <div className="ChallengeItem row" key={challenge.id.toString()}>
        <div className="col-2">
          <img className="listItemThumb btn" 
             src={`/uploads/challenge${challenge.id}/${challenge.thumbnail}`} 
             alt={`challenge ${challenge.id} thumbnail`}  />
        </div>
        <div className="col">
          <h4>
            <Link to={`/challenge/${challenge.id}`}>
            {challenge.title}
            </Link>
          </h4>
          <p>Status: {challenge.status}</p>
        </div>
      </div>
    );
    return (<div className="ChallengeList grid">{t}</div>);
  }
}




export default ChallengeListScreen;