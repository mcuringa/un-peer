import React from 'react';
import _ from "lodash";
import {Link} from "react-router-dom";
import {XIcon, ThreeBarsIcon} from "react-octicons";

import FBUtil from "./FBUtil";
import notifications from "./Notifications";
import moment from "moment";


class MainMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.signout = _.bind(this.signout, this);
    this.markAllRead = _.bind(this.markAllRead, this);
    this.open = false;
  }

  signout() {
    const firebase = FBUtil.getFB();
    firebase.auth().signOut().then(()=> {
      console.log('Signed Out');
    }, (error)=> {
      console.error('Sign Out Error', error);
    });
  }



  componentDidUpdate(prevProps) {
    // Typical usage (don't forget to compare props):
    if (this.props.closeMainMenu) {
      const menu = document.getElementById("MainMenuInner");
      if(menu)
        menu.classList.remove("show");
    }
  }



  markAllRead() {
    this.open = !this.open;
    const t = 3 * 1000;
    const updateDB = ()=> {
      if(this.open) {
        notifications.markAllRead();
      }
    }
    _.delay(updateDB, t);
  }

  render() {
    const hide = ()=> {
      let menu = document.getElementById("MainMenuInner")
      const f = ()=> {
        if(menu)
          menu.classList.remove("show");
      }
      _.delay(f, 200);
      
    }

    return (

      <div className="MainMenu icon-lg d-flex justify-content-end">
        <button id="MainMenuIcon" type="button" 
          className="MainMenuIcon btn btn-link m-0 p-0 bg-none" 
          onClick={this.markAllRead} 
          data-toggle="collapse" 
          data-target="#MainMenuInner" aria-expanded="false">
          <NotificationBadge alerts={this.props.alerts} /><ThreeBarsIcon />
        </button>
        <div id="MainMenuInner"className="collapse no-Screen-padding">
          <div className="MainMenuItems container" onClick={hide}>
            <button type="button" className="btn dropdown-item disabled">About</button>
            <button type="button" className="btn dropdown-item disabled">Help</button>
            <button type="button" onClick={this.signout} className="btn dropdown-item">Sign Out</button>
            <Link to="/confirm-reset" className="btn dropdown-item">Reset Password</Link>
            <AdminMenu user={this.props.user} />
            <Alerts alerts={this.props.alerts} user={this.props.user} />
          </div>
        </div>
      </div>
    );
  }
}

const AdminMenu = (props)=> {
  if(!props.user.admin)
    return null;
  return (
    <div>
      <div className="dropdown-divider"></div>
      <Link to="/admin/users" className="btn dropdown-item">
        Manage Users
      </Link> 
      <Link to="/admin/challenges" className="btn dropdown-item">
        Manage Challenges
      </Link> 
    </div>
  )
}

const Alert = (props)=> {

  const a = props.alert;
  const alertElId = `Alert_${a.id}`;
  const Action = (props)=> {
    const css = "AlertMessage dropdown-item text-left";
    const style = {whiteSpace: "normal", lineHeight: "1.1em"};
    if(a.clickAction) {
      const path = new URL(a.clickAction).pathname;
      // console.log("alert action path", path);
      return (
        <Link className={`d-block ${css}`} style={style} to={path}>{props.children}</Link>
      )
    }
    return <div className={`${css} disabled`} style={style} >{props.children}</div>;
  }

  const del = (e)=> {
    console.log("deleting a msg");
    document.getElementById(alertElId).classList.remove("d-flex");
    document.getElementById(alertElId).classList.add("d-none");
    e.stopPropagation();
    notifications.delete(a);
  }

  const read = (a.read === true)?"read":"unread";

  return (
    <div id={alertElId} className={`NotificationAlert d-flex justify-content-between align-items-start mt-2 ${read}`} key={alert.id}>
      <Action>
        <h6 className="NotificationTitle mb-0">
          {a.title}
          <small className="NotificationSent text-muted pl-1">{moment(a.sent).fromNow()}</small>
        </h6>
        <small className="NotificationBody text-muted">{a.body}</small>
      </Action>
      <button className="btn btn-link pl-3 pt-0 pb-0 pr-2 icon-dark" onClick={del}><XIcon /></button>
    </div>
  )
}

const Alerts = (props)=> {
  const f = a=>{return (<Alert alert={a} key={a.id} />)}
  const alerts = _.map(props.alerts, f);
  return (
    <div>
      <div className="dropdown-divider"></div>
      {alerts}
    </div>
  )
}



const NotificationBadge = (props)=> {
  let unread = 0;
  const f = (a)=>{
    if(a.read !== true)
      unread++;
  }
  _.each(props.alerts, f);

  if(unread === 0)
    return null;

  return (
    <span className="NotificationBadge badge badge-secondary badge-pill">{unread}</span>
  )
}

export default MainMenu;
