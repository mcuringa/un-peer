import React from 'react';
import "./Challenges.css";
import ChallengeDB from "./ChallengeDB";
import _ from "lodash";


const ChallengeDetailScreen = ({match}) => {

  const challenge = ChallengeDB.findById(match.params.id);
  console.log(challenge);
  return (
      <div className="ChallengeDetail">
        
        <div className="row">
          <div className="col-3">
            <img className="listItemThumb btn" 
               src={`/uploads/challenge${challenge.id}/${challenge.thumbnail}`} 
               alt={`challenge ${challenge.id} thumbnail`}  />
          </div>
          <div className="col">
            <h4><a href="#/detail">{challenge.title}</a></h4>
          </div>
        </div>
        
        <div className="row">
          <div className="col-3 text-right">Status:</div>
          <div className="col">{challenge.status}</div>
        </div>
        
        <div className="row">
          <div className="col-3 text-right">Start:</div>
          <div className="col">{challenge.start}</div>
        </div>
        
        <div className="row">
          <div className="col-3 text-right">End:</div>
          <div className="col">{challenge.end}</div>
        </div>

        <p>{challenge.prompt}</p>
      </div>
    );
};



export default ChallengeDetailScreen;