import React from 'react';
import FBUtil from "../FBUtil";
import _ from "lodash";
import {Link} from "react-router-dom";


import Modal from "../Modal";
import {Spinner} from "../LoadingModal"

import db from "../DBTools";
import df from "../DateUtil";

import {ChallengeDB, ChallengeStatus} from "../challenges/Challenge";
import {StarRatings, StarGradient} from "../challenges/ChallengeReviewScreen";
import {ImageUploadImproved} from "../FormUtil";
import {UploadProgress} from "../MediaManager";
import {snack, SnackMaker} from "../Snackbar";



class ProfileScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "loadingResponses": true,
      "loadingChallenges": true,
      "dirty": false,
      user: props.user,
      profileImg: props.user.profileImg,
      reset: false,
      challenges: [],
      responses: []

    };

    this.uploadSizeLimit = 2100000;

    this.handleChange = this.handleChange.bind(this);
    this.sendPass = this.sendPass.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 2000);
    this.handleUpload = _.bind(this.handleUpload, this);
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
    this.clearImage = _.bind(this.clearImage, this);
  }

  componentWillMount() {
    const firebase = FBUtil.init();
    let fbu = firebase.auth().currentUser;
    this.setState({lastLogin:fbu.metadata.lastSignInTime});
    
    ChallengeDB.findByOwner(this.props.user.uid).then((t)=>{
      this.setState({ challenges: t, loadingChallenges: false });
    });

    ChallengeDB.findResponsesByOwner(this.props.user.uid).then((t)=>{
      this.setState({ responses: t, loadingResponses: false });
    });

  }

  clearImage() {
    const oldImage = this.state.profileImg;

    const undo = ()=>{
      this.setState({profileImg: oldImage});
      this.save();
    }
    const commit = ()=>{
      const data = { profileImg: this.state.profileImg };
      db.update("/users", this.props.user.uid, data)
    }

    this.setState({profileImg: null});
    this.snack("Profile image removed", true).then(commit, undo);


  }
 
  handleUpload(e) {

    let file = e.target.files[0];
    const key = e.target.id;
    if(file.size > this.uploadSizeLimit) {
      this.snack("Image not saved.");
      this.setState({fileSizeExceeded: true});
      return;
    }

    this.setState({fileSizeExceeded: false});

    this.setState({dirty: true, loading: true, uploading: true});
    this.snack("Uploading new profile image.");


    const succ = (task)=> {
      this.setState({
        pct: 0,
        uploadMsg: "",
        loading: false,
        uploading: false
      });

      this.setState({profileImg: task.snapshot.downloadURL});
      this.save();
    }

    const watch = (snapshot)=> {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;

      this.setState( {
        pct: progress, 
      });
    }

    const err = (e)=>{
      this.snack("Image upload failed");
      console.log(e);
    }

    FBUtil.uploadMedia(file, this.props.user.uid, watch, succ, err);
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

  save() {

    this.snack("saving image");
    const data = { profileImg: this.state.profileImg };
    db.update("/users", this.props.user.uid, data).then(()=>{
      this.snack("profile updated");
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
  
    const profileImg = this.state.profileImg || "/img/profile.png";
    const progress = (<UploadProgress pct={this.state.pct} msg={this.state.uploadMsg} />);

    const UploadError = ()=> {
      if(!this.state.fileSizeExceeded)
        return null;

      return (
        <div className="alert alert-secondary text-danger mb-2 mt-2" role="alert">
          The image you slected is too big. Please upload an image smaller than 2MB.
        </div>
      )

    }


    return (
      <div className="ProfileScreen screen">
        <StarGradient />
        <div className="mt-2 d-flex justify-content-end">
          <button type="button" onClick={this.sendPass} className="btn btn-secondary btn-sm mr-2">Reset Password</button>         
          <button type="button" onClick={this.signout} className="btn btn-secondary btn-sm">
              Sign Out
          </button>
        </div>

        <div className="Profile d-flex mt-3 mb-2 justify-content-start align-content-center">

          <ImageUploadImproved 
            id="profileImg"
            className="ProfileImage"
            label=""
            img={profileImg}
            onChange={this.handleUpload}
            progressBar={progress}
            clearImage={this.clearImage} />

          <div className="ml-3 text-left">
            <div className="font-weight-bold">{`${this.props.user.firstName} ${this.props.user.lastName}`}</div>
            <div className="">{this.props.user.email}</div>
            <div className="">{df.ts(this.state.lastLogin)}</div>
          </div>
        </div>
        <UploadError />
        <MyChallenges challenges={this.state.challenges} loading={this.state.loadingChallenges} />
        <MyResponses responses={this.state.responses} loading={this.state.loadingResponses} />

        <this.Snackbar />
        <Modal id="ResetModal"
          show={this.state.reset} 
          body="Please check your email for instructions on resetting your password."/>
      </div>
    );
  }
}


const MyResponses = (props)=>{

  const Response = (r)=> {
    return (
      <div className="" key={_.uniqueId("response_")}>
        <div className="font-weight-bold d-flex bg-light align-items-baseline justify-content-between">
          <Link className="d-block" to={`/challenge/${r.challengeId}/review#${r.id}`}>{r.challengeTitle}</Link>
          <small className="d-block">{df.df(r.created)}</small>
        </div>
        <div className="d-flex align-content-start pl-3">
          <div style={{width:"100px"}}>
            <StarRatings className="pt-1 pr-2" rating={r.avgRating} />
          </div>
          {r.title}
        </div>
      </div>
    )
  }

  let CardBody = <Spinner />
  if(!props.loading)
    CardBody = _.map(props.responses, Response);

  return (
    <div className="card mt-2">
      <div className="card-body">
        <h5 className="card-title">My Responses</h5>
        {CardBody}
      </div>
    </div>
  )
}




const MyChallenges = (props)=>{

  const Challenge = (c)=>{
    return (
      <div className="" key={_.uniqueId("challenge_")}>
        <ChallengeLink challenge={c} />
        <ChallengeMsg challenge={c} />
      </div>
    )
  }

  let CardBody = <Spinner />
  if(!props.loading)
    CardBody = _.map(props.challenges, Challenge);

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title">My Challenges</h5>
        {CardBody}
      </div>
    </div>
  )
}

const ChallengeLink = (props) => {
  if(props.challenge.status === ChallengeStatus.DRAFT)
    return <strong><Link to={`/challenge/${props.challenge.id}/edit`}>{props.challenge.title}</Link></strong>

  return <strong><Link to={`/challenge/${props.challenge.id}/review`}>{props.challenge.title}</Link></strong>
}

const ChallengeMsg = (props) => {
  if(props.challenge.status === ChallengeStatus.DRAFT) {
    return (
      <div className="text-muted">Draft created on: {df.ts(props.challenge.created)}</div>
    )
  }

  if(props.challenge.status === ChallengeStatus.REVIEW) {
    return (
      <div className="text-muted"><em>Under review.</em> Last modified: {df.ts(props.challenge.modified)}</div>
    )
  }

  return (
      <div className="text-muted"><strong>Published.</strong> {df.range(props.challenge.start, props.challenge.end, )}</div>
    )
}



export default ProfileScreen;
