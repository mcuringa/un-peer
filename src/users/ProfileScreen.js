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

// const ProfileScreen = (props)=>{
//   console.log("Profile Screen");
//   console.log(props.user.displayName);
//   const firebase = FBUtil.init();
//   const user = firebase.auth().currentUser;
//   return (
//     <div className="ProfileScreen screen">
//       <ProfileForm user={user} />
//     </div>
//   );

// }

class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);
    // const firebase = FBUtil.init();
    // let fbu = firebase.auth().currentUser;
    let user = {email: props.user.email, displayName: props.user.displayName, uid: props.user.uid};

    this.state = {
      "loading": false,
      "dirty": false,
      user: user
    };
    this.handleChange = this.handleChange.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 2000);
  }

  save() {

    this.setState({loading: true});
    this.props.user.updateProfile({
      displayName: this.state.user.displayName
    }).then(()=> {
      this.setState({loading: false});
    }).catch(function(error) {
      console.log(error);
    });
  } 

  handleChange(e) {
    let user = this.state.user;
    user[e.target.id] = e.target.value; 
    e.preventDefault();
    this.setState({user: user});
    this.save();

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
    const user = this.state.user;
    return (
      <div className="ProfileScreen screen card bg-light">
        <div className="card-header">
          <div className="row">
            <div className="col-11 text-strong">Update your profile</div>
            <div className="col-1">
              <StatusIndicator dirty={this.state.dirty} loading={this.state.loading} />
            </div>
          </div>
          <div className="row">
            <div className="small text-muted col">user id: {user.uid}</div>
          </div>
        </div>
        <form>
          <TextGroup id="displayName"
            value={user.email} 
            label="Email" 
            readOnly={true}
            plaintext={true} />

          <TextGroup id="displayName"
            value={user.displayName} 
            label="Display name" 
            onChange={this.handleChange} 
            required={true}
            help="Choose how your name will show for other users." />
          <button type="button" onClick={this.signout} className="btn btn-secondary">
            Sign Out
          </button>
        </form>
    </div>
    );
  }
}





export default ProfileScreen;