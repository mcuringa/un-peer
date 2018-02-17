import React, { Component } from "react";

import {
  BrowserRouter as Router,
  Route,
  Link,
  Switch,
  Redirect,
  withRouter
} from "react-router-dom";


import {
  HomeIcon,
  BellIcon,
  CalendarIcon,
  PersonIcon,
  BriefcaseIcon,
  BookmarkIcon

} from 'react-octicons';

import FBUtil from './FBUtil.js';
import Home from './Home.js';
import ChallengeListScreen from './challenges/ChallengeList.js';
import ChallengeDetailScreen from './challenges/ChallengeDetail.js';
import ChallengeEditScreen from './challenges/ChallengeEdit.js';
import NewChallengeScreen from './challenges/NewChallenge.js';
import Login from './users/Login.js';
import ProfileScreen from './users/ProfileScreen.js';

export default class App extends Component {
  constructor(props) {
    super(props);


    this.state = {user: {} };
  }

  componentWillMount() {
    const firebase = FBUtil.init();
    firebase.auth().onAuthStateChanged((user)=> {
      if (user) {
        this.setState({user: user});
      } else {
        this.setState({user: {}});
      }
    });
  }


  render() {
    let Main;
    console.log(this.state.user.email);
    if(!this.state.user.email)
      Main = (<Login user={this.state.user} />);
    else
      Main = (<SecureScreens user={this.state.user} />);

    // Main = (<Login user={this.state.user} />);

    return (
      <Router>
        <div className="App container">
          <Header user={this.state.user} />
          <section id="main" className="">{Main}</section>
          <Footer user={this.state.user} />
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


const SecureScreens = (props)=>{
  return (
    <div>
      <Switch>        
        <Route exact path="/" component={Home} />
        <Route exact path="/archive" component={ChallengeListScreen} archive={true} />
        <Route path="/challenge/:id/edit" component={ChallengeEditScreen} />
        <Route exact path="/challenge/new" component={NewChallengeScreen} />
        <Route path="/challenge/:id/:action" component={ChallengeDetailScreen}/>
        <Route path="/challenge/:id/" component={ChallengeDetailScreen}/>
        <Route path="/profile" render={()=><ProfileScreen user={props.user} />} />
      </Switch>
    </div>
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
          <Link to="/archive" className="btn btn-btn-light btn-block">
            <BriefcaseIcon /><br/>
            Archives
          </Link>
          <Link to="/" className="btn btn-btn-light btn-block">
            <BookmarkIcon /><br/>
            Bookmarks
          </Link>
          <Link to="/profile" className="btn btn-btn-light btn-block">
            <PersonIcon /><br/>
            Profile
          </Link>
        </div>
      </div>

    </footer>
  );

}


