import React from "react";
import {ChallengeListItem} from './challenges/ChallengeList.js';
import { Link } from 'react-router-dom';
import {ChallengeDB, Challenge} from "./challenges/Challenge.js"
import df from "./DateUtil";
import { PrimitiveDotIcon } from 'react-octicons';


class Home  extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenge: Challenge};
    this.active = false;
  }


  componentWillMount() {

    const activate = (c)=>{ this.active= true; this.setState({challenge: c}); };
    const noActiveChallenge = ()=>{ console.log("no active challenge"); };
    ChallengeDB.getActive().then(activate, noActiveChallenge);

  }

  render() {
    console.log("home screen");

    if(!this.active) {
      return (
        <div className="screen home">
          <ChallengeButton />
        </div>
      );
    }

    return (
      <div className="screen home">
        <ActiveChallenge 
          challenge={this.state.challenge} />
        <ChallengeButton />
      </div>
    );
  }

}

const ActiveChallenge = (props) => {
  const challenge = props.challenge;

  return (
    <Link to={`/challenge/${challenge.id}`} 
          className="ActiveChallenge">
      <h4 className="text-right pt-4 pr-2">Challenge of the week</h4>
      <h5 className="text-right pb-4 pr-2">Status: Active <span className="m-2 p-1 rounded bg-success"></span></h5>
      <h5 className="text-center pt-4 mt-4">{challenge.title}</h5>
    </Link>
  );
}

const ChallengeButton = (props)=> {

  return (
    <Link to="/challenge/new" className="NewChallengeButton btn">
      Submit a Challenge
    </Link>
  );
}

export default Home;