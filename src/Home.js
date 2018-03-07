import React from "react";
import { Link } from 'react-router-dom';
import {ChallengeDB, Challenge} from "./challenges/Challenge.js"
import { PrimitiveDotIcon } from 'react-octicons';


class Home  extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenge: Challenge};
    this.active = false;
    // this.props.setAppClass("Home");
  }


  componentWillMount() {

    const activate = (c)=>{ this.active= true; this.setState({challenge: c}); };
    const noActiveChallenge = ()=>{ console.log("no active challenge"); };
    ChallengeDB.getActive().then(activate, noActiveChallenge);

  }

  render() {
    if(!this.active) {
      return (
        <div className="Home screen">
          <ChallengeButton />
        </div>
      );
    }

    return (
      <div className="Home screen">
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
      <h5 className="text-right pb-4 pr-2 text-capitalize">Status: {challenge.stage}
      <PrimitiveDotIcon className={`pt-1 ml-1 mr-1 icon-${challenge.stage}`} /></h5>
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
