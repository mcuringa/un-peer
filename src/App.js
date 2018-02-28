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
import {ChallengeListScreen} from './challenges/ChallengeList.js';
import ChallengeDetailScreen from './challenges/ChallengeDetail.js';
import ChallengeEditScreen from './challenges/ChallengeEdit.js';
import NewChallengeScreen from './challenges/NewChallenge.js';
import Login from './users/Login.js';
import ProfileScreen from './users/ProfileScreen.js';
import ManageUsersScreen from './users/ManageUsersScreen';

export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {user: {} };
    this.setAppClass = this.setAppClass.bind(this);

  }

  componentWillMount() {
    const firebase = FBUtil.init();
    this.setState( {appClass: ""});

    firebase.auth().onAuthStateChanged((user)=> {
      if (user) {
        this.setState({user: user});
      } else {
        this.setState({user: {}});
      }
    });
  }

  setAppClass(clazz) {
    this.setState({appClass: clazz});
  }

  render() {
    let Main;

    if(!this.state.user.email)
      Main = (
        <div className={`App container login`}>
          <Login user={this.state.user} setAppClass={this.setAppClass} loadingHandler={this.loadingHandler} />
        </div>
      );
    else
      Main = (
        <Router>
          <div className={`App container`}>
            <Header user={this.state.user} />
            <section id="main" className="">
              <SecureScreens user={this.state.user} setAppClass={this.setAppClass} />
            </section>
            <Footer user={this.state.user} />
          </div>
        </Router>
      );
    return (Main);
  }
}


const Header = (props)=>{
  return (
    <header className="App-header container fixed-top">
      <div className="row">
        <div className="App-home col-2">
          <Link to="/">
            <HomeIcon />
          </Link>
        </div>
        <div className="App-title col-8">UN Peer Challenges</div>
      </div>
    </header>
  );
}


const SecureScreens = (props)=>{
  return (
      <Switch>        
        <PropsRoute exact path="/" setAppClass={props.setAppClass} component={Home} />
        <Route exact path="/archive" component={ChallengeListScreen} />
        <PropsRoute  user={props.user} path="/challenge/:id/edit"  component={ChallengeEditScreen} />
        <PropsRoute  user={props.user} exact path="/challenge/new" component={NewChallengeScreen} />
        <PropsRoute  user={props.user} path="/challenge/:id/:action" component={ChallengeDetailScreen}/>
        <PropsRoute path="/challenge/:id/" user={props.user} component={ChallengeDetailScreen}/>
        
        <PropsRoute path="/profile" user={props.user} component={ProfileScreen} />
        <PropsRoute path="/users" user={props.user} component={ManageUsersScreen} />
      </Switch>
  );
}

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}

const PropsRoute = ({ component, ...rest }) => {
  return (
    <Route {...rest} render={routeProps => {
      return renderMergedProps(component, routeProps, rest);
    }}/>
  );
}

const Footer = (props)=>{
  
  let disabled = (props.user.email)?"":" disabled";

  if(true) return null;

  return (
    <footer className="App-footer container fixed-bottom">
      <div className="App-footer-toolbar btn-toolbar" role="toolbar" aria-label="Bottom navigation">
        <div className="btn-group btn-group-justified" role="group" aria-label="Bottom navigation">

          <Link to="/" className={`btn btn-btn-light btn-block disabled`}>
            <CalendarIcon /><br/>
            Calendar
          </Link>
          <Link to="/archive" className={`btn btn-btn-light btn-block${disabled}`}>
            <BriefcaseIcon /><br/>
            Archives
          </Link>
          <Link to="/" className="btn btn-btn-light btn-block disabled">
            <BookmarkIcon /><br/>
            Bookmarks
          </Link>
          <Link to="/profile" className={`btn btn-btn-light btn-block${disabled}`}>
            <PersonIcon /><br/>
            Profile
          </Link>
        </div>
      </div>

    </footer>
  );

}


