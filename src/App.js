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
import LoadingModal from './LoadingModal.js';

import {ChallengeListScreen} from './challenges/ChallengeList.js';
import ChallengeDetailScreen from './challenges/ChallengeDetail.js';
import {ChallengeEditScreen} from './challenges/ChallengeEdit.js';
import NewChallengeScreen from './challenges/NewChallenge.js';
import ChallengeResponseForm from './challenges/ChallengeResponseForm.js';
import ResponseRatings from './challenges/ResponseRatings.js';
import ChallengeReviewScreen from './challenges/ChallengeReviewScreen.js';
import ProfessorResponseForm from './challenges/ProfessorResponseForm.js';
import ManageChallengesScreen from './challenges/ManageChallenges.js';


import AdminScreen from './admin/AdminScreen';

import BookmarkScreen from './users/BookmarkScreen.js';
import BookmarkDetailScreen from './users/BookmarkDetailScreen.js';
import CalendarScreen from './CalendarScreen.js';

import Login from './users/Login.js';
import ProfileScreen from './users/ProfileScreen.js';
import ManageUsersScreen from './users/ManageUsersScreen';
import db from "./DBTools";
import {ChallengeDB} from "./challenges/Challenge";


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {user: {}, 
      loading: true,
      userLoaded: false,
      loadingMsg: "Signing in..."
    };
    this.setAppClass = this.setAppClass.bind(this);
    this.userListener = this.userListener.bind(this);
    this.updateAppUser = this.updateAppUser.bind(this);
  }

  updateAppUser(u) {
    this.setState({user: u});
  }

  userListener(authUser) {

    const loadChallenges = ()=> {
      this.setState({loadingMsg: "Loading challenges..."})
      ChallengeDB.findAll().then(()=>{
        this.setState({challengesLoaded: true});
      });
    }

    const loadBookmarks = ()=>{
      let u = this.state.user;
      const path = `/users/${u.uid}/bookmarks`;
      return db.findAll(path).then((bookmarks)=>{
        u.bookmarks = bookmarks;
        this.setState({user: u});
      });
    }

    let loaduser = ()=>{
      db.get("/users", authUser.uid).then((u)=>{
        console.log("user loaded");
        this.setState({user: u, loading: false, userLoaded: true, loadingMsg: "Loading assets..."});
        loadChallenges();
        loadBookmarks();
        
      });
    }

    loaduser = _.once(loaduser);
    if(authUser && authUser.email) {
      console.log("authUser.email");
      console.log(authUser.email);
      loaduser();
    }
    else {
      this.setState({user: {}, loading: false, userLoaded: true});
    }
  }

  componentWillMount() {
    this.setState({appClass: null});
    FBUtil.getAuthUser(this.userListener);

  }

  setAppClass(clazz) {
    console.log("updating app class");
    this.setState({appClass: clazz});
  }

  render() {

    if(this.state.userLoaded && !this.state.user.email){
      return (
        <div className={`App container login`}>
          <Login user={this.state.user} setAppClass={this.setAppClass} loadingHandler={this.loadingHandler} />
        </div>
      );
    }


    if(!this.state.userLoaded || !this.state.challengesLoaded) {

      return (
        <Router>
          <div className={`App container`}>
            <Header user={this.state.user} />
            <section id="main" className="">
              <LoadingModal show={true} status={this.state.loadingMsg} />
            </section>
            <Footer user={this.state.user} />
          </div>
        </Router>
      )
    }



    return (
      <Router>
        <SecureScreens 
          user={this.state.user}
          updateAppUser={this.updateAppUser}
          setAppClass={this.setAppClass} />
      </Router>
    );
  }
}

const AppContainer = (props)=> {
  return (
    <div id={props.id} className={`App container ${props.appClass||""}`}>
      <Header user={props.user} />
      <section id="main">{props.children}</section>
      <Footer user={props.user} />
    </div>
  )
}


const Header = (props)=>{
  return (
    <header className="App-header container fixed-top">
      <div className="d-flex align-items-center justify-content-between">
        <div className="App-home">
          <NavLink to="/" exact={true} activeclass="active">
            <div className="home-icon"></div>
          </NavLink>
        </div>
        <div className="App-title">UN Peer Challenges</div>
        <div className="App-notifications">
          <NavLink to="/notifications">
            <img src="/img/header/Notification_unclicked_btn.png"
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
        <ScreenRoute  id="Home" {...props} exact path="/" component={Home} />
        <ScreenRoute  id="ChallengeListScreen" {...props} exact path="/archive"   component={ChallengeListScreen} />
        <ScreenRoute  id="CalendarScreen" {...props} path="/calendar"  component={CalendarScreen} />
        <ScreenRoute  id="BookmarkDetailScreen" {...props} path="/bookmarks/:id"  component={BookmarkDetailScreen} />
        <ScreenRoute  id="BookmarkScreen" {...props} path="/bookmarks"  component={BookmarkScreen} />
        <ScreenRoute  id="NewChallengeScreen" {...props} exact path="/challenge/new" component={NewChallengeScreen} />
        <ScreenRoute  id="ChallengeEditScreen" {...props} path="/challenge/:id/edit"  component={ChallengeEditScreen} />
        <ScreenRoute  id="ChallengeResponseForm" {...props} path="/challenge/:id/respond" component={ChallengeResponseForm}/>
        <ScreenRoute  id="ProfessorResponseForm" {...props} path="/challenge/:id/prof" component={ProfessorResponseForm} />
        <ScreenRoute  id="ResponseRatings" {...props} path="/challenge/:id/rate" component={ResponseRatings} />
        <ScreenRoute  id="ChallengeReviewScreen" {...props} path="/challenge/:id/review" component={ChallengeReviewScreen} />
        <ScreenRoute  id="ChallengeDetailScreen" {...props} path="/challenge/:id" component={ChallengeDetailScreen} />
        <ScreenRoute  id="ProfileScreen" {...props} path="/profile"  component={ProfileScreen} />
        <ScreenRoute  id="Login" {...props} path="/login" component={Login} />
        <ScreenRoute  id="Login" {...props} path="/signout" component={Login} />
        <ScreenRoute  id="ManageUsersScreen" {...props} path="/admin/users" component={ManageUsersScreen} />
        <ScreenRoute  id="ManageChallengesScreen" {...props} path="/admin/challenges" component={ManageChallengesScreen} />
        <ScreenRoute  id="AdminScreen" {...props} path="/admin" component={AdminScreen} />
        

      </Switch>
  );
}

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}

const ScreenRoute = ({ component, ...rest }) => {

  return (
    <AppContainer id={rest.id} appClass={rest.appClass||""} user={rest.user}>
      <Route {...rest} render={routeProps => {
        return renderMergedProps(component, routeProps, rest);
      }}/>
    </AppContainer>
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
                    Favourites
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


