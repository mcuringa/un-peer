import React, { Component } from "react";


import ChallengeListScreen from './challenges/ChallengeList.js';

import Login from './users/Login.js';

let loggedIn = true;

export default class Home extends Component {
  render() {
    if(loggedIn)
      return <ChallengeListScreen home="true" />

    return <Login />

  }
}
