import React from 'react';
import FBUtil from "./FBUtil";
import {Link} from "react-router-dom";


import Modal from "./Modal";
import MoreMenu from "./MoreMenu";

class MainMenu extends React.Component {
  constructor(props) {
    super(props);

    this.state = { };

    this.sendPass = this.sendPass.bind(this);
  }
  sendPass(e) {
    e.preventDefault();
    const firebase = FBUtil.init();
    
    firebase.auth().sendPasswordResetEmail(this.props.user.email)
      .then(()=> {
        console.log("reset succeeded");
        // $('#resetModal').modal();
        this.setState({
          sent: true,
          reset: true
        });
      })
      .catch((error)=> {
        console.log(error);
      });
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
    const AdminMenu = ()=> {
      if(!this.props.user.admin)
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

    return (
      <div className="MainMenu icon-lg">
        <MoreMenu menuIcon="bars" direction="dropdown">
          <button type="button" onClick={this.signout} className="btn dropdown-item">
              Sign Out
          </button>
          <button type="button" onClick={this.sendPass} className="btn dropdown-item">
            Reset Password
          </button>
          <button type="button" className="btn dropdown-item disabled">Help</button>
          <button type="button" className="btn dropdown-item disabled">About</button>
          <AdminMenu />
        </MoreMenu>
        <Modal id="ResetModal"
          title="PasswordReset"
          show={this.state.reset} 
          body="Please check your email for instructions on resetting your password."/>
      </div>
    );
  }
}
export default MainMenu;
