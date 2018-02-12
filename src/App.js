import React, { Component } from "react";

import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Link,
    Switch
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

import Home from './Home.js';
import Login from './Login.js';
import ChallengeListScreen from './challenges/ChallengeList.js';
import ChallengeDetailScreen from './challenges/ChallengeDetail.js';
import ChallengeEditScreen from './challenges/ChallengeEdit.js';

export default class App extends Component {
  render() {
    return (
      <Router>
        <div className="App container">
          <Header/>
          <section id="main">
            <Route exact path="/" component={Home}/>
            <Route path="/challenge/:id" component={ChallengeDetailScreen}/>
            <Route path="/challenge/:id/edit" component={ChallengeEditScreen} edit="true"/>
            <Route path="/challenge/new" component={ChallengeEditScreen} edit="false"/>
          </section>
          <Footer/>
        </div>
      </Router>
    );
  }
}

const Header = (props)=>{
  return (
    <header className="App-header container fixed-top">
      <div className="row">
        <div className="App-home col-2">
          <Link to="/"><HomeIcon /></Link>
        </div>
        <div className="App-title col-8">UN Peer Challenges</div>
        <div className="App-alert col-2 text-right"><BellIcon /></div>
      </div>
    </header>
  );
}

const Footer = (props)=>{
  return (
    <footer className="App-footer container fixed-bottom">
      <div className="App-footer-toolbar btn-toolbar" role="toolbar" aria-label="Bottom navigation">
        <div className="btn-group btn-group-justified mr-2" role="group" aria-label="Bottom navigation">

          <Link to="/" className="btn btn-btn-light btn-block">
            <CalendarIcon /><br/>
            Calendar
          </Link>
          <Link to="/challenge/new" className="btn btn-btn-light btn-block">
            <FileTextIcon /><br/>
            Submit
          </Link>
          <Link to="/" className="btn btn-btn-light btn-block">
            <BriefcaseIcon /><br/>
            Archives
          </Link>
          <Link to="/" className="btn btn-btn-light btn-block">
            <BookmarkIcon /><br/>
            Bookmarks
          </Link>
          <Link to="/" className="btn btn-btn-light btn-block">
            <PersonIcon /><br/>
            Profile
          </Link>
        </div>
      </div>

    </footer>
  );

}
