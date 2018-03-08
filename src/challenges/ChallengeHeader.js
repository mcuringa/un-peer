import React from 'react';
import {Link} from 'react-router-dom';
import df from "../DateUtil";
import {PencilIcon} from "react-octicons";

const EditLink = (props) => {
  if(!props.user.admin)
    return null;
  return <Link to={`/challenge/${props.challenge.id}/edit`}><PencilIcon className="ml-2" /></Link>
}


const ChallengeHeader = (props) => {
  const c = props.challenge;
  let stageMsg = "Challenge starts: " + df.day(c.start);
  if(c.stage === "active")
    stageMsg = `Response time: ${df.range(c.start, c.ratingsDue)}`;
  else if(c.stage === "archive")
    stageMsg = `Archived: ${df.range(c.start, c.end)}`;
  else if(c.stage === "rating")
    stageMsg = `Rating time: ${df.range(c.start, c.end)}`;
  else if(c.stage === "review")
    stageMsg = `Review until: ${df.day(c.end)}`;


  return (
    <div className="ChallengeDetailHeader">
      <div className="StartDate">
        <img src="/img/calendar.png" className="mr-2" alt="calendar icon" />
        {stageMsg}
      </div>
      <h4>{props.challenge.title}
      <small><EditLink user={props.user} challenge={props.challenge} /></small></h4>
      <div>Challenge owner: {props.owner.firstName} {props.owner.lastName} </div>
    </div>
  );
}

export default ChallengeHeader;
