import React from 'react';
import FBUtil from "../FBUtil";
import _ from "lodash";
import {
  TextGroup,
  TextInput,
  TextAreaGroup,
  StatusIndicator,
  LoadingSpinner,
} from "../FormUtil";

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
      newUser: UserDB.NewUser
    };

    this.handleNewUserChange = this.handleNewUserChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.addUser = this.addUser.bind(this);
    this.addUser = this.addUser.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 2000);
  }

  componentWillMount() {
    db.findAll("/users").then((t)=>{
      this.setState({users: t});
      console.log(t);
    });

  }

  addUser(e) {
    e.preventDefault();
    this.setState({loading: true});
    console.log("creating user");
    // this.setState({loading: true});
    const user = this.state.newUser;
    const addToState = (u)=> {
      const all = _.merge(this.state.users, {[u.uid]: u});
      this.setState({users: all, loading: false});
    };

    UserDB.create(user).then(addToState);

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

    this.setState({users: _.merge(this.state.users, {uid: user})});
    this.save();

  }

  save() {
    //pass
  }


  render() {
    const onChange = (uid)=> {
      const f = (e)=>{this.handleChange(e, uid);};
      return f;    
    }

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
          submit={this.addUser} />

      </div>

    );
  }
}

const NewUserForm = (props)=> {
  return (
    <form className="NewUserForm" onSubmit={(e)=>{e.preventDefault();}}>
      <div className="row">
        <div className="col">
          <TextInput id="firstName" 
            onChange={props.onChange}
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
          <button type="button" className="btn btn-sm" onClick={props.submit}>
            add user
          </button>
        </div>
      </div>
    </form>
  );
}
export default ManageUsersScreen;