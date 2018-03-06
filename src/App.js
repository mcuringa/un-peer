import React, { Component } from "react";
import _ from "lodash";

import {
  BrowserRouter as Router,
  Route,
  NavLink,
  Switch,
} from "react-router-dom";

import FBUtil from './FBUtil.js';
import Home from './Home.js';
import {ChallengeListScreen} from './challenges/ChallengeList.js';
import ChallengeDetailScreen from './challenges/ChallengeDetail.js';
import {ChallengeEditScreen} from './challenges/ChallengeEdit.js';
import NewChallengeScreen from './challenges/NewChallenge.js';
import ChallengeResponseForm from './challenges/ChallengeResponseForm.js';
import ResponseRatings from './challenges/ResponseRatings.js';
import ChallengeReviewScreen from './challenges/ChallengeReviewScreen.js';

import BookmarkDetailScreen from './BookmarkDetail.js';
import BookmarksScreen from './BookmarksScreen.js';
import CalendarScreen from './CalendarScreen.js';

import Login from './users/Login.js';
import ProfileScreen from './users/ProfileScreen.js';
import ManageUsersScreen from './users/ManageUsersScreen';
import db from "./DBTools";


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {user: {} };
    this.setAppClass = this.setAppClass.bind(this);
    this.userListener = this.userListener.bind(this);

  }

  userListener(authUser) {
    console.log("user listener called");


    if(!authUser) {
      this.setState({user: {}});
      return;
    }

    db.get("/users", authUser.uid).then((u)=>{
      this.setState({user: u});
    });

  }

  componentWillMount() {
    FBUtil.getAuthUser(this.userListener);
  }

  setAppClass(clazz) {
    this.setState({appClass: clazz});
  }

  render() {

    // console.log(`Authenticated user: ${this.state.user.email}`);
    // console.log(`DB user: ${this.state.user.firstName} ${this.state.user.lastName}`);
    // console.log("Is admin: " + this.state.user.admin);

    let Main;

    if(!this.state.user.email)
      return (
        <div className={`App container login`}>
          <Login user={this.state.user} setAppClass={this.setAppClass} loadingHandler={this.loadingHandler} />
        </div>
      );


    return (
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
  
  }
}


const Header = (props)=>{
  return (
    <header className="App-header container fixed-top">
      <div className="row">
        <div className="App-home col-2">
            <NavLink to="/" exact={true}>
                <div className="outer-circle"></div>
                <img src="/img/header/Home_unclicked_btn.png"
                     width="31" height="28"
                     alt="Home icon" />
          </NavLink>
        </div>
        <div className="App-title col-8">UN Peer Challenges</div>
        <div className="App-notifications col-2">
            <NavLink to="/notifications">
                <div className="outer-circle">
                </div>
                <img src="/img/header/Notification_unclicked_btn.png"
                     width="25" height="28"
                     alt="Notification icon" />
          </NavLink>
        </div>
      </div>
    </header>
  );
}


const SecureScreens = (props)=>{
  return (
      <Switch>
        <PropsRoute exact path="/" setAppClass={props.setAppClass} component={Home} />
        <Route exact path="/archive" component={ChallengeListScreen} />

        <PropsRoute  user={props.user} path="/calendar"  component={CalendarScreen} />
        <PropsRoute  user={props.user} path="/bookmarks"  component={BookmarksScreen} />
        <PropsRoute  user={props.user} path="/bookmark/:id"  component={BookmarkDetailScreen} />
        
        <PropsRoute  user={props.user} exact path="/challenge/new" component={NewChallengeScreen} />
        <PropsRoute  user={props.user} path="/challenge/:id/edit"  component={ChallengeEditScreen} />
        <PropsRoute  user={props.user} path="/challenge/:id/respond" component={ChallengeResponseForm}/>
        <PropsRoute  user={props.user} path="/challenge/:id/rate" component={ResponseRatings}/>
        <PropsRoute  user={props.user} path="/challenge/:id/review" component={ChallengeReviewScreen}/>
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

  return (
    <footer className="App-footer container fixed-bottom">
      <div className="App-footer-toolbar btn-toolbar" role="toolbar" aria-label="Bottom navigation">
        <div className="btn-group btn-group-justified" role="group" aria-label="Bottom navigation">

            <NavLink
                to="/calendar"
                className={`btn btn-btn-light calendar-icon btn-block${disabled}`}>
                <div className="icon-box">
                    <img src="/img/footer/Calendar_unclicked_btn.png"
                         width="21" height="22"
                         alt="Calendar icon" />
                </div>

                <div className="icon-box">
                    Calendar
                </div>
            </NavLink>
            <NavLink
                to="/archive"
                className={`btn btn-btn-light archives-icon btn-block${disabled}`}>
                <div className="icon-box">
                    <img src="/img/footer/Archive_unclicked_btn.png"
                         width="18" height="18"
                         alt="Archives icon" />
                </div>
                <div className="icon-box">
                    Archives
                </div>
            </NavLink>
            <NavLink
                to="/bookmarks"
                className={`btn btn-btn-light bookmarks-icon btn-block${disabled}`}>
                <div className="icon-box">
                    <img src="/img/footer/Bookmarks_unclicked_btn.png"
                         width="20" height="18"
                         alt="Bookmarks icon" />
                </div>
                <div className="icon-box">
                    Bookmarks
                </div>
            </NavLink>
            <NavLink
                to="/profile"
                className={`btn btn-btn-light profile-icon btn-block${disabled}`}>
                <div className="icon-box">
                    <img src="/img/footer/Profile_unclicked_btn.png"
                         width="17" height="17"
                         alt="Profile icon" />
                </div>
                <div className="icon-box">
                    Profile
                </div>
            </NavLink>
        </div>
      </div>

    </footer>
  );

}


