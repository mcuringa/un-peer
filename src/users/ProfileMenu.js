import React from 'react';
import {Link} from "react-router-dom";
import { ChevronRightIcon } from "react-octicons";


const ProfileMenu = (props)=> {

  return (
    <div className="ProfileMenu screen">
      <ChallengeMenuItem to="/my/challenges" text="My Challenges" />
      <ChallengeMenuItem to="/my/responses" text="My Responses" />
    </div>
  )

}

const ChallengeMenuItem = (props)=> {

  return (
    <Link to={props.to} className="ProfileMenuItem">
      <h5 className="">{props.text}</h5>
      <div className="icon-lg"><ChevronRightIcon /></div>
    </Link>
  )

}

export default ProfileMenu;
