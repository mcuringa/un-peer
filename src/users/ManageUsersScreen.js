import React from 'react';
import _ from "lodash";
import {ChevronDownIcon} from "react-octicons";

import {TextInput, StatusIndicator} from "../FormUtil";
import Modal from "../Modal";
import db from "../DBTools";
import FBUtil from "../FBUtil";
import {snack, SnackMaker} from "../Snackbar";


class ManageUsersScreen extends React.Component {
  constructor(props) {
    super(props);
    console.log("manage users");

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

    this.confirmDeleteUser = _.bind(this.confirmDeleteUser, this);
    this.deleteUser = _.bind(this.deleteUser, this);
    this.sendReset = _.bind(this.sendReset, this);

    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
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

  sendReset(user) {
    console.log("Sending " + user.email);
    FBUtil.sendPasswordResetEmail(user.email).then(()=>{
      console.log("Reset email sent to " + user.email);
      this.snack("Reset email sent to " + user.email);
    });
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
      if(parts.length === 1) {
        u.firstName = "";
        u.lastName = "";
        u.email = parts[0];
      }
      else if(parts.length === 2) {
        u.firstName = parts[0];
        u.lastName = "";
        u.email = parts[1];
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

    this.snack("Creating user for " + user.email);

    const addToFirestore = (u)=>{ 
      console.log("data from cloud function");
      console.log(u);

      const uid = u.data.uid;

      let data = {
        admin: false, 
        su: false, 
        student: true,
        created: new Date()
      };

      data.uid = uid;
      data.email = user.email;
      data.firstName = user.firstName;
      data.lastName = user.lastName;

      return db.save("/users", uid, data);
    };

    const afterCreate = (data)=> {
      console.log("after user created do this");
      console.log(data);
      this.snack("New user created");
      FBUtil.sendPasswordResetEmail(user.email);
      let all = this.state.users;
      all[data.uid] = data;

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
      // this.setState({userExists: true});
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

    const createUser = FBUtil.getCloudFunction("createUser");
    createUser(user).then(addToFirestore, err).then(afterCreate);

  }

  handleChange(e, uid) {
    e.preventDefault();
    console.log("handle change");
    console.log(uid);


    let user = this.state.users[uid];
    user[e.target.id] = e.target.value;
    user.changed = true;
    let users = this.state.users;
    users[user.uid] = user;

    this.setState({users: users, focusNewUser: false});
    this.save();

  }

  confirmDeleteUser(u) {
    this.setState({deleteUser: u});
  }

  deleteUser() {
    this.snack("Deleting user.");
    const id = this.state.deleteUser.uid;
    db.delete("/users", id).then(()=>{
      console.log("delete complete");
      this.snack("User deleted");
      let all = this.state.users;
      console.log(id);
      delete all[id];
      console.log(all[id]);
      this.setState({users: all, deleteUser: null});
    });
  }


  save() {
    console.log("saving...");
    this.snack("Saving...");
    this.setState({ loading: true });
    let changeList = _.filter(this.state.users, (u)=>{return u.changed===true} );
    changeList = _.values(changeList);
    
    const afterSave = ()=> {
      console.log("saving...");
      let t = _.map(this.state.users,u=>{u.changed = false; return u;});
      t = _.keyBy(t, u=>u.id);

      this.setState({loading: false, dirty: false, users: t});
      this.snack("Save complete");
    }
    const idFunction = u=>u.uid;
    db.saveAll("users", changeList, idFunction).then(afterSave);
  }

  render() {
    if(!this.props.user.admin)
      return null;

    let delUserName = "";
    if(this.state.deleteUser)
      delUserName = `${this.state.deleteUser.firstName} ${this.state.deleteUser.lastName}`
    
    return (
      <div className="ManageUsersScreen screen" style={{marginBottom: "60px"}}>
        <div className="d-flex justify-content-between align-items-center">
          <h4>User Manager</h4>
          <div className="pr-1">
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
          users={this.state.users}
          sendReset={this.sendReset}
          deleteUser={this.confirmDeleteUser} />

        <Modal id="confirmDeleteUser" 
          title="Delete User" 
          show={this.state.deleteUser}
          onConfirm={this.deleteUser}
          closeHandler={()=>{this.setState({deleteUser:false})}}
          >
          <div className="text-danger">
            Really delete <strong>{delUserName}</strong>?
          </div>
        </Modal>
        <this.Snackbar />
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

    <div className="row m-auto" key={`uid_${u.uid}`}>
      <div className="col-2">
        <TextInput  id="firstName" onChange={onChange(u.uid)} value={u.firstName} />
      </div>
      <div className="col-3">
        <TextInput id="lastName" onChange={onChange(u.uid)}  value={u.lastName} />
      </div>
      <div className="col-5">
        <TextInput id="email" onChange={onChange(u.uid)}  value={u.email} />
      </div>

      <div className="col-1 text-center">
        {(u.admin)?"✓":""}
      </div>

      <div className="col-1 text-center d-flex justify-content-center align-items-baseline icon-secondary">
        <UserMenu {...props} user={u} />
      </div>

    </div>
  )}


  const rows = _.map(props.users, row);

  return (
    <form className="CurrentUserList" onSubmit={(e)=>{e.preventDefault();}}>
      <div className="row text-center bg-dark text-light m-auto">
        <div className="col-2 text-strong">First name</div>
        <div className="col-3 text-strong">Last name</div>
        <div className="col-5 text-strong">Email</div>
        <div className="col-2 text-strong">Admin</div>
      </div>
      {rows}
    </form>
  );

}

const UserMenu = (props)=> {
  const u = props.user;
  const reset = ()=> { props.sendReset(u); }
  const del = ()=> { props.deleteUser(u); }

  return (
    <div className="border-0 bg-light">
      <button type="button" className="btn btn-link bg-light mb-0 pb-0 icon-secondary rounded-circle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <ChevronDownIcon />
      </button>
      <div className="dropdown-menu dropdown-menu-right">
        <button className="dropdown-item" type="button" onClick={reset}>Send Password Reset</button>
        <button className="dropdown-item" type="button" onClick={del}>Delete User</button>
      </div>
    </div>
  )

}


export default ManageUsersScreen;
