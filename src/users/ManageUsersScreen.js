import React from 'react';
import FBUtil from "../FBUtil";
import _ from "lodash";
import {
  TextGroup,
  TextInput,
  StatusIndicator,
  LoadingSpinner,
} from "../FormUtil";


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
      newUser: UserDB.NewUser,
      focusNewUser: true,
      userExists: false
    };

    this.handleNewUserChange = this.handleNewUserChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addUser = this.addUser.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 2000);
  }

  componentWillMount() {
    db.findAll("/users").then((t)=>{
      this.setState({users: _.keyBy(t, u=>u.id)});
    });

  }

  addUser(e) {
    e.preventDefault();
    this.setState({loading: true});
    const user = this.state.newUser;
    
    const afterCreate = (u)=> {
      console.log("after user created do this");
      let all = this.state.users;
      all.uid = user;
      // this.setState({users: all});
      this.setState({
        users: all, 
        loading: false, 
        focusNewUser: true,
        newUser: UserDB.NewUser
      });
    };

    const err = (e)=>{
      console.log("failed to create user");
      console.log(e);
      if(e.code == "auth/email-already-in-use") {
        this.setState({userExists: true});
        this.setState({loading: false});
      }
    }

    UserDB.create(user).then(afterCreate, err);

  }

  handleNewUserChange(e) {
    e.preventDefault();

    let user = this.state.newUser;
    user[e.target.id] = e.target.value; 
    this.setState({newUser: user});

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
    let changeList = _.filter(this.state.users, (u)=>{return u.changed==true} );
    changeList = _.values(changeList);

    // console.log(changeList);


    
    const afterSave = ()=> {
      console.log("saving...");
      let t = _.map(this.state.users,u=>{u.changed = false; return u;});
      t = _.keyBy(t, u=>u.id);

      this.setState({loading: false, dirty: false, users: t});
    }
    const cleanKeys = (u)=>{return _.pick(u, UserDB.userKeys) };
    
    const cleanData = _.map(changeList, cleanKeys);
    // console.log(changeList);
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
          onChange={this.handleNewUserChange} 
          user={this.state.newUser} 
          autoFocus={this.state.focusNewUser} 
          submit={this.addUser} />

        <UserList
          onChange={this.handleChange}
          users={this.state.users} />

        <Modal show={this.state.userExists} id="UserExists"
          body={`Could not create user with email ${this.state.newUser.email} because account already exists.`}
          />
      </div>

    );
  }
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

const NewUserForm = (props)=> {
  return (
    <form className="NewUserForm" onSubmit={props.submit}>
      <div className="row">
        <div className="col">
          <TextInput id="firstName" 
            onChange={props.onChange}
            autoFocus={props.autoFocus}
            placeholder="first" value={props.user.firstName} />
        </div>
        <div className="col">
          <TextInput id="lastName"
            placeholder="last"
            onChange={props.onChange}  value={props.user.lastName} />
        </div>
        <div className="col">
            <TextInput id="email" onChange={props.onChange}
            placeholder="email"  value={props.user.email} />
        </div>
        <div className="col">
          <button type="button" className="btn btn-block" onClick={props.submit}>
            add user
          </button>
        </div>
      </div>
    </form>
  );
}
export default ManageUsersScreen;