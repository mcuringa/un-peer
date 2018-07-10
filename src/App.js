import React, { Component } from "react";
import _ from "lodash";

import {
  BrowserRouter as Router,
  Route,
  Link,
  NavLink,
  Switch,
} from "react-router-dom";

import FBUtil from './FBUtil.js';
import Home from './Home.js';
import LoadingModal from './LoadingModal.js';
import notifications from "./Notifications"

import { CalendarIcon, HeartIcon, ProfileIcon, ArchiveIcon } from "./UNIcons";

import {ChallengeListScreen} from './challenges/ChallengeList.js';
import ChallengeDetailScreen from './challenges/ChallengeDetail.js';
import {CloseChallengeScreen} from './challenges/CloseChallenge.js';
import NewChallengeScreen from './challenges/NewChallenge.js';
import ChallengeResponseForm from './challenges/ChallengeResponseForm.js';
import ResponseRatings from './challenges/ResponseRatings.js';
import ChallengeReviewScreen from './challenges/ChallengeReviewScreen.js';
import ProfessorResponseForm from './challenges/ProfessorResponseForm.js';
import ChallengeReportScreen from './challenges/ChallengeReportScreen.js';
import ManageChallengesScreen from './challenges/ManageChallenges.js';
import ManageResponsesScreen from './challenges/ManageResponses.js';


import AdminScreen from './admin/AdminScreen';
import MainMenu from './MainMenu';
import {StarGradient} from './StarRatings';

import BookmarkScreen from './users/BookmarkScreen.js';
import BookmarkDetailScreen from './users/BookmarkDetailScreen.js';
import CalendarScreen from './CalendarScreen.js';

import Login from './users/Login.js';
import ProfileScreen from './users/ProfileScreen.js';
import MyChallengesScreen from './users/MyChallenges.js';
import MyResponsesScreen from './users/MyResponses.js';
import ManageUsersScreen from './users/ManageUsersScreen';
import db from "./DBTools";
import {ChallengeDB} from "./challenges/Challenge";


export default class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      user: {}, 
      loading: true,
      userLoaded: false,
      closeMainMenu: false,
      loadingMsg: "Signing in..."
    };
    this.userListener = this.userListener.bind(this);
    this.updateAppUser = this.updateAppUser.bind(this);
    this.loadNotifications = this.loadNotifications.bind(this);
    this.watchNotifications = this.watchNotifications.bind(this);
    this.topLevelNavListener = this.topLevelNavListener.bind(this);

  }

  topLevelNavListener() {
    this.setState({closeMainMenu: true});
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
        this.setState({user: u, loading: false, userLoaded: true, loadingMsg: "Loading assets..."});
        loadChallenges();
        loadBookmarks();       
      });
    }

    loaduser = _.once(loaduser);

    if(authUser && authUser.email) {
      console.log("logged in", authUser.email);
      loaduser();
      FBUtil.enableMessaging();
      notifications.addListener(this.loadNotifications);
      this.watchNotifications();
    }
    else {
      this.setState({user: {}, loading: false, userLoaded: true});
    }
  }



  componentWillMount() {
    FBUtil.getAuthUser(this.userListener);
    this.loadNotifications();
  }

  loadNotifications() {
    const hasAlerts = (alerts)=>{ this.setState({alerts: _.keyBy(alerts,"id")}) };
    const noAlerts = (alerts)=>{ this.setState({alerts: {}}) };
    notifications.all(this.state.user).then(hasAlerts, noAlerts).catch(()=>{console.log("error in App load notifications");});
  }


  watchNotifications() {
    this.loadNotifications();
    setTimeout(this.watchNotifications, 1000 * 60);
  }


  render() {

    if(this.state.userLoaded && !this.state.user.email){
      return (
        <div id="LoginScreen" className={`App container login`}>
          <Login user={this.state.user} loadingHandler={this.loadingHandler} />
        </div>
      );
    }


    if(!this.state.userLoaded || !this.state.challengesLoaded) {

      return (
        <Router>
          <div className={`App container`}>
            <Header user={this.state.user} topLevelNavListener={this.topLevelNavListener} closeMainMenu={this.state.closeMainMenu} alerts={_.values(this.state.alerts)} />
            <section id="main" className="">
              <LoadingModal show={true} status={this.state.loadingMsg} />
            </section>
            <Footer user={this.state.user} topLevelNavListener={this.topLevelNavListener} />
          </div>
        </Router>
      )
    }



    return (
      <Router>
        <SecureScreens 
          user={this.state.user}
          topLevelNavListener={this.topLevelNavListener}
          closeMainMenu={this.state.closeMainMenu}
          updateAppUser={this.updateAppUser}
          alerts={_.values(this.state.alerts)}  />
      </Router>
    );
  }
}

const AppContainer = (props)=> {
  return (
    <div id={props.id} className={`App container`}>
      <StarGradient />
      <Header user={props.user} topLevelNavListener={props.topLevelNavListener} closeMainMenu={props.closeMainMenu}  alerts={props.alerts} />
      <section id="main">{props.children}</section>
      <Footer user={props.user} topLevelNavListener={props.topLevelNavListener}  />
    </div>
  )
}


const Header = (props)=>{
  return (
    <header className="App-header container fixed-top pt-1">
      <div className="d-flex justify-content-between pr-0">
        <div className="App-home">
          <NavLink to="/" exact={true} onClick={ props.topLevelNavListener } activeclass="active">
            <img src="data:image/png;base64,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" alt="logo" />
          </NavLink>
        </div>
        <div className="App-title">UN Peer Challenge</div>
        <MainMenu user={props.user} closeMainMenu={props.closeMainMenu} alerts={props.alerts} />
      </div>
    </header>
  );
}


const SecureScreens = (props)=> {
  return (
    <Switch>
      <ScreenRoute  id="Home" {...props} exact path="/" component={Home} />
      <ScreenRoute  id="ChallengeListScreen" {...props} exact path="/archive"   component={ChallengeListScreen} />
      <ScreenRoute  id="CalendarScreen" {...props} path="/calendar"  component={CalendarScreen} />
      <ScreenRoute  id="BookmarkDetailScreen" {...props} path="/bookmarks/:id"  component={BookmarkDetailScreen} />
      <ScreenRoute  id="BookmarkScreen" {...props} path="/bookmarks"  component={BookmarkScreen} />
      <ScreenRoute  id="NewChallengeScreen" {...props} exact path="/challenge/new" component={NewChallengeScreen} />
      <ScreenRoute  id="ManageResponsesScreen" {...props} path="/challenge/:id/edit/responses" component={ManageResponsesScreen} />
      <ScreenRoute  id="ChallengeEditScreen" {...props} path="/challenge/:id/edit"  component={NewChallengeScreen} />
      <ScreenRoute  id="CloseChallengeScreen" {...props} path="/challenge/:id/close"  component={CloseChallengeScreen} />
      <ScreenRoute  id="ChallengeResponseForm" {...props} path="/admin/response/:id/:rid" component={ChallengeResponseForm}/>
      <ScreenRoute  id="ChallengeResponseForm" {...props} path="/challenge/:id/respond" component={ChallengeResponseForm}/>
      <ScreenRoute  id="ProfessorResponseForm" {...props} path="/challenge/:id/prof" component={ProfessorResponseForm} />
      <ScreenRoute  id="ResponseRatings" {...props} path="/challenge/:id/rate" component={ResponseRatings} />
      <ScreenRoute  id="ChallengeReportScreen" {...props} path="/challenge/:id/report" component={ChallengeReportScreen} />
      <ScreenRoute  id="ChallengeReviewScreen" {...props} path="/challenge/:id/review" component={ChallengeReviewScreen} />
      <ScreenRoute  id="ChallengeDetailScreen" {...props} path="/challenge/:id" component={ChallengeDetailScreen} />
      
      <ScreenRoute  id="ProfileScreen" {...props} exact path="/profile"  component={ProfileScreen} />
      <ScreenRoute  id="ConfirmPassReset" {...props} exact path="/confirm-reset"  component={ConfirmPassReset} />
      <ScreenRoute  id="MyChallengesScreen" {...props} exact path="/my/challenges"  component={MyChallengesScreen} />
      <ScreenRoute  id="MyResponsesScreen" {...props} exact path="/my/responses"  component={MyResponsesScreen} />
      
      <ScreenRoute  id="Login" {...props} path="/login" component={Login} />
      <ScreenRoute  id="Login" {...props} path="/signout" component={Login} />
      <ScreenRoute  id="ManageUsersScreen" {...props} path="/admin/users" component={ManageUsersScreen} />
      <ScreenRoute  id="ManageChallengesScreen" {...props} path="/admin/challenges" component={ManageChallengesScreen} />
      <ScreenRoute  id="AdminScreen" {...props} path="/admin" component={AdminScreen} />
    </Switch>
  );
}

const ConfirmPassReset = (props)=> {


  const firebase = FBUtil.getFB();

  firebase.auth().sendPasswordResetEmail(props.user.email)
  .catch((error)=> {    console.log(error);  });


  return (
    <div className="ConfirmPassReset screen">
      <div className="alert alert-secondary" role="alert">
        <h5 class="alert-heading">Password reset</h5>
        <p>Please check your email <tt>&lt;{props.user.email}&gt;</tt> for instructions on how to reset your password.</p>
        <hr />
        <Link className="btn btn-secondary" to="/">Home</Link>
      </div>
    </div>
  )
}

const renderMergedProps = (component, ...rest) => {
  const finalProps = Object.assign({}, ...rest);
  return (
    React.createElement(component, finalProps)
  );
}

const ScreenRoute = ({ component, ...rest }) => {
  // console.log("rest.setMainModal", rest.setMainModal);
  return (
    <AppContainer id={rest.id} user={rest.user} alerts={rest.alerts} {...rest}>
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
                onClick={ props.topLevelNavListener}
                className={`btn btn-btn-light calendar-icon btn-block${disabled}`}>
                <div className="icon-box">
                  <CalendarIcon />
                </div>

                <div className="icon-box">
                    Calendar
                </div>
            </NavLink>
            <NavLink
                to="/archive"
                onClick={ props.topLevelNavListener}
                className={`btn btn-btn-light archives-icon btn-block${disabled}`}>
                <div className="icon-box"><ArchiveIcon /></div>
                <div className="icon-box">Archives</div>
            </NavLink>
            <NavLink
                to="/bookmarks"
                onClick={ props.topLevelNavListener}
                className={`btn btn-btn-light bookmarks-icon btn-block${disabled}`}>
                <div className="icon-box"><HeartIcon /></div>
                <div className="icon-box">Favourites</div>
            </NavLink>
            <NavLink
                to="/profile"
                onClick={ props.topLevelNavListener}
                className={`btn btn-btn-light profile-icon btn-block${disabled}`}>
                <div className="icon-box"><ProfileIcon /></div>
                <div className="icon-box">Profile</div>
            </NavLink>
        </div>
      </div>

    </footer>
  );

}


