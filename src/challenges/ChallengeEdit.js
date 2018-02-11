import React from 'react';
import _ from "lodash";
import {CalendarIcon} from 'react-octicons';
import dateFormat from 'dateformat';
import { Link } from 'react-router-dom'
import {User, Challenge} from "./Challenge.js"

import FBUtil from "../FBUtil";


class ChallengeEditScreen extends React.Component {
  constructor(props) {
    super(props);
    const id = this.props.match.params.id || "";
    this.state = {
      challenge: {id: id}, 
      owner: User
    };
  }

  // componentWillMount() {
  //   const id = this.props.match.params.id;
  //   ChallengeDB.get(id,(c)=>{
  //     this.setState({"owner": c.owner});
  //     this.setState({challenge: c});
  //   });

  render() {
    return (
      <div>Edit Challenge
      </div>);
  }
}

export default ChallengeEditScreen;