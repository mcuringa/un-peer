import React, { Component } from "react";

import {
  BrowserRouter as Router,
  Route,
  Link
} from 'react-router-dom';

import {
  HomeIcon,
  BellIcon,
  CalendarIcon,
  PersonIcon,
  BriefcaseIcon,
  BookmarkIcon,
  FileTextIcon

} from 'react-octicons';

import ChallengeListScreen from './challenges/ChallengeList.js';

import Login from './Login.js';

let loggedIn = true;

export default class Home extends Component {
  render() {
    if(loggedIn)
      return <ChallengeListScreen home="true" />

    return <Login />

  }
}
