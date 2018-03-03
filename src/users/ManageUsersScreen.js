import React from 'react';
import _ from "lodash";
import {TextInput, StatusIndicator} from "../FormUtil";


import { Redirect } from 'react-router-dom';


import UserDB from "./UserDB";
import Modal from "../Modal";
import db from "../DBTools";


class ManageUsersScreen extends React.Component {
  constructor(props) {
    super(props);

    let users = {};

    this.state = {
      loading: false,
      dirty: false,
      users: users,
      focusNewUser: true,
      userExists: false,
      newUser: "",
      newUserError: "",
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleNewUserChange = this.handleNewUserChange.bind(this);
    this.addUser = this.addUser.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 2000);
  }

  componentWillMount() {
    db.findAll("/users").then((t)=>{
      this.setState({users: _.keyBy(t, u=>u.id)});
    });

  }

  handleNewUserChange(e) {
    e.preventDefault();
    this.setState({newUser: e.target.value});
  }

  addUser(e) {
    e.preventDefault();
    this.setState({loading: true});

    console.log("adding user");
    console.log(this.state.newUser);

    const parseUser = (val)=> {
      let u = {};
      let parts = val.trim().split(" ");
      if(parts.length === 0)
        return {};
      if(parts.length === 1)
        u.email = parts[0];
      else if(parts.length===2) {
        u.firstName = parts[0];
        u.lastName = parts[1];
        u.email = parts[2];
      }
      else {
        u.firstName = _.slice(parts, 0, parts.length-2).join(" ");
        u.lastName = parts[parts.length-2];
        u.email = parts[parts.length-1];
      }
      return u;
    }

    const user = parseUser(this.state.newUser);
    console.log(user);

    if(_.size(user) === 0)
      return;

    const afterCreate = (u)=> {
      console.log("after user created do this");
      let all = this.state.users;
      all.uid = user;
      this.setState({
        users: all, 
        loading: false, 
        focusNewUser: true,
        newUser: ""
      });
    };

    const err = (e)=>{
      console.log("failed to create user");
      console.log(e);
      this.setState({userExists: true});
      this.setState({loading: false});
      if(e.code === "auth/email-already-in-use") {
        const msg = `User could not be created because an account for ${user.email} already exists.`;
        this.setState({newUserError: msg});
      }
      else if(e.code === "auth/invalid-email") {
        const msg = `Could not create account. Please enter a valid email address.`;
        this.setState({newUserError: msg});
      }
      else {
        const msg = `Failed to add user: ${e.message}`;
        this.setState({newUserError: msg});
      }

    }

    UserDB.create(user).then(afterCreate, err);

  }

  handleChange(e, uid) {
    e.preventDefault();


    let user = this.state.users[uid];
    user[e.target.id] = e.target.value;
    user.changed = true;
    let users = this.state.users;
    users[user.uid] = user;

    this.setState({users: users, focusNewUser: false});
    this.save();

  }

  save() {
    console.log("saving...");
    this.setState({ loading: true });
    let changeList = _.filter(this.state.users, (u)=>{return u.changed===true} );
    changeList = _.values(changeList);

    // console.log(changeList);


    
    const afterSave = ()=> {
      console.log("saving...");
      let t = _.map(this.state.users,u=>{u.changed = false; return u;});
      t = _.keyBy(t, u=>u.id);

      this.setState({loading: false, dirty: false, users: t});
    }
    const idFunction = u=>u.uid;
    db.saveAll("users", changeList, idFunction).then(afterSave);
  }


  render() {
    if(this.props.user.admin)
      return <Redirect push to="/" />
    
    return (
      <div className="ManageUsersScreen screen">
        <div className="row">
          <div className="col-11">
            <h4>User Manager</h4>
          </div>
          <div className="col-1">
            <StatusIndicator dirty={this.state.dirty} loading={this.state.loading} />
          </div>
        </div>

        <NewUserForm 
          autofocus
          submit={this.addUser}
          newUser={this.state.newUser}
          onChange={this.handleNewUserChange} />

        <UserList
          onChange={this.handleChange}
          users={this.state.users} />

        <Modal show={this.state.userExists} id="UserExists"
          body={`Could not create user with email ${this.state.failedEmail} because account already exists.`}
          />
      </div>

    );
  }
}


const NewUserForm = (props)=> {
  return (
    <form className="NewUserForm" onSubmit={props.submit}>
      <div className="input-group mb-3">
        <input type="text" 
          className="form-control"
          onChange={props.onChange}
          value={props.newUser}
          placeholder="Ex: Test User test@example.com or just.test@example.com"
          aria-label="Add user" />
        <div className="input-group-append">
          <button type="button" className="btn btn-secondary" onClick={props.submit}>
            add user
          </button>
        </div>
      </div>
    </form>
  );
}



const UserList = (props) => {
    
  const onChange = (uid)=> {
    const f = (e)=>{props.onChange(e, uid);};
    return f;    
  }


  const row=(u)=> { return (

    <div className="row" key={`uid_${u.uid}`}>
      <div className="col-2">
        <TextInput  id="firstName" onChange={onChange(u.uid)} value={u.firstName} />
      </div>
      <div className="col-3">
        <TextInput id="lastName" onChange={onChange(u.uid)}  value={u.lastName} />
      </div>
      <div className="col-5">
        <TextInput id="email" onChange={onChange(u.uid)}  value={u.email} />
      </div>
      <div className="col-2 form-check pt-2">
          <input className="form-check-input" 
            type="checkbox" id="admin" 
            name="admin" checked={u.admin} />
      </div>
    </div>
  )}

  // let userList = _.values(props.users);
  // userList = _.sortBy(userList, u=> u.firstName.toUpperCase() );

  const rows = _.map(props.users, row);

  return (
    <form className="CurrentUserList" onSubmit={(e)=>{e.preventDefault();}}>
      <div className="row text-center bg-dark text-light">
        <div className="col-2 text-strong">First name</div>
        <div className="col-3 text-strong">Last name</div>
        <div className="col-5 text-strong">Email</div>
        <div className="col-2 text-strong">Admin</div>
      </div>
      {rows}
    </form>
  );

}


export default ManageUsersScreen;
