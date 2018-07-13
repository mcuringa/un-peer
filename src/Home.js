import React from "react";
import { Link } from 'react-router-dom';
import {ChallengeDB} from "./challenges/Challenge.js"
import { PrimitiveDotIcon } from 'react-octicons';

class Home  extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenge: {},
      loading: true
    };
  }


  componentWillMount() {
    const activate = (c)=>{ 
      this.active = true; 
      this.setState({challenge: c, loading: false}); 
    };
    const noActiveChallenge = ()=>{ 
      console.log("no active challenge"); 
      this.setState({ loading: false }); 
    };
    ChallengeDB.getActive().then(activate, noActiveChallenge);

  }

  render() {

    return (
      <div className="Home screen">
        <ActiveChallenge 
          challenge={this.state.challenge} 
          loading={this.state.loading}/>
        <ChallengeButton />
      </div>
    );
  }

}

const ActiveChallenge = (props) => {
  const challenge = props.challenge;

  if(!props.challenge.id) {
    return (
      <div className="ActiveChallenge">
        <h4 className="text-right pt-4 pr-2">Challenge of the week</h4>
        <h5 className="text-right pb-4 pr-2">&nbsp;</h5>
        <h5 className="text-center pt-4 mt-4">No active challenge</h5>
      </div>
    )


  }

  return (
    <Link to={`/challenge/${challenge.id}`} className="ActiveChallenge">
      <h4 className="text-right pt-4 pr-2">Challenge of the week</h4>
      <h5 className="text-right pb-4 pr-2 text-capitalize">Status: {challenge.stage}
      <PrimitiveDotIcon className={`pt-1 ml-1 mr-1 icon-${challenge.stage}`} /></h5>
      <h5 className="text-center pt-4 mt-4">{challenge.title}</h5>
    </Link>
  );
}

const ChallengeButton = (props)=> {
  return (
    <Link to="/challenge/new" className="NewChallengeButton d-flex align-items-center">
      <h4 className="m-auto">Submit a Challenge</h4>
    </Link>
  );
}

export default Home;
