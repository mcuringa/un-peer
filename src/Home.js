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
import ChallengeDetailScreen from './challenges/ChallengeDetail.js';
import ChallengeEditScreen from './challenges/ChallengeEdit.js';

import Login from './Login.js';

let loggedIn = false;

export default class Home extends Component {
  render() {
    if(loggedIn)
      return <ChallengeListScreen />

    return <Login />

  }
}
