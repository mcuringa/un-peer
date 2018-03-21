import React from 'react';
import {Link} from 'react-router-dom';
import df from "../DateUtil";
import {PencilIcon, ChevronLeftIcon} from "react-octicons";

const EditLink = (props) => {
  if(!props.user.admin)
    return null;
  return <Link to={`/challenge/${props.challenge.id}/edit`}><PencilIcon className="ml-2" /></Link>
}


const ChallengeHeader = (props) => {
  const c = props.challenge;
  let owner = {firstName:"", lastName:""};
  if(c.owner)
    owner = c.owner;
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
      <BackButton hideBack={props.hideBack} challenge={props.challenge} />
      <div className="StartDate">
        <img src="/img/calendar.png" className="mr-2" alt="calendar icon" />
        {stageMsg}
      </div>
      <h4>{props.challenge.title}
      <small><EditLink user={props.user} challenge={props.challenge} /></small></h4>
      <div>Challenge owner: {owner.firstName} {owner.lastName} </div>
      <h6 className="text-right text-uppercase">{props.screenTitle}</h6>
    </div>
  );
}

const BackButton = (props)=>{
  if(props.hideBack)
    return null;
  return (
    <Link className="text-dark mb-2" to={`/challenge/${props.challenge.id}`}>
      <ChevronLeftIcon className="icon-dark pt-1 mr-1" />Back
    </Link>
  )
}

export default ChallengeHeader;
