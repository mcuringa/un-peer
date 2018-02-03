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

      <div className="ChallengeItem" key={challenge.id.toString()}>
        <Link to={`/challenge/${challenge.id}`} className="list-group-item list-group-item-action flex-column align-items-start">
          <div className="d-flex w-100 justify-content-between">
            <h5 className="mb-1">{challenge.title}</h5>
            <small>{challenge.start}-{challenge.end}</small>
          </div>
          <p class="mb-1">Donec id elit non mi porta gravida at eget metus. Maecenas sed diam eget risus varius blandit.</p>
          <small>Donec id elit non mi porta.</small>
        </Link>
      </div>
    );
    return (
      <div className="ChallengeList">
        <h4 className="sticky-top navbar-light bg-light">challenges</h4>
        <div className="list-group">{t}</div>
      </div>
    );
  }
}




export default ChallengeListScreen;