import React from 'react';
import _ from "lodash";
import {Link} from "react-router-dom";
import {XIcon, ThreeBarsIcon} from "react-octicons";

import FBUtil from "./FBUtil";
import notifications from "./Notifications";

class MainMenu extends React.Component {
  constructor(props) {
    super(props);
    this.state = {}
  }

  signout() {
    const firebase = FBUtil.init();
    firebase.auth().signOut().then(()=> {
      console.log('Signed Out');
    }, (error)=> {
      console.error('Sign Out Error', error);
    });
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
        <button id="MainMenuIcon" type="button" className="MainMenuIcon btn btn-link m-0 p-0 bg-none" data-toggle="collapse" data-target="#MainMenuInner" aria-expanded="false">
          <NotificationBadge alerts={this.props.alerts} /><ThreeBarsIcon />
        </button>
        <div id="MainMenuInner"className="collapse no-Screen-padding">
          <div className="MainMenuItems container" onClick={hide}>
            <Alerts alerts={this.props.alerts} user={this.props.user} />
            <button type="button" onClick={this.signout} className="btn dropdown-item">Sign Out</button>
            <Link to="/confirm-reset" className="btn dropdown-item">Reset Password</Link>
            <button type="button" className="btn dropdown-item disabled">Help</button>
            <button type="button" className="btn dropdown-item disabled">About</button>
            <AdminMenu user={this.props.user} />
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
  const Action = (props)=> {
    if(a.clickAction) {
      return (
        <Link className={`dropdown-item`} to={a.clickAction}>{props.children}</Link>
      )
    }
    return <div className={`dropdown-item`}>{props.children}</div>;
  }

  const del = (e)=> {
    console.log(e);
    e.stopPropagation();
    notifications.delete(a);
  }

  return (
    <div className="NotificationAlert d-flex justify-content-between align-items-top" key={alert.id}>
      <Action>
        <div>{a.title}</div>
        <small>{a.body}</small>
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
      {alerts}
      <div className="dropdown-divider"></div>
    </div>
  )
}



const NotificationBadge = (props)=> {
  if(props.alerts.length === 0)
    return null;
  return (
    <span className="NotificationBadge badge badge-secondary badge-pill">{props.alerts.length}</span>
  )
}

export default MainMenu;
