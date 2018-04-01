import React from 'react';
import FBUtil from "../FBUtil";
import _ from "lodash";
import {Link} from "react-router-dom";


import Modal from "../Modal";
import MoreMenu from "../MoreMenu";
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
    

    const sortChallenges = (t)=> {
      const now = new Date();
      const uid = this.props.user.uid;

      const activeF = (c)=> {
        return c.status === ChallengeStatus.PUBLISHED && c.start < now && c.end > now;
      }
      const futureF = (c)=> {
        return c.start > now && c.status === ChallengeStatus.PUBLISHED;
      }

      const statusF = (status)=> {
        return (c)=>{return c.status === status};
      }

      const pastF = (c)=>{ return c.status===ChallengeStatus.PUBLISHED && c.end < now; }

      const st = {
        active: _.filter(t, activeF),
        drafts: _.filter(t,statusF(ChallengeStatus.DRAFT)),
        deleted: _.filter(t,statusF(ChallengeStatus.DELETE)),
        pending: _.filter(t,statusF(ChallengeStatus.REVIEW)),
        past: _.filter(t,pastF),
        future: _.filter(t,futureF),
        loadingChallenges: false
      };
      this.setState(st);
    }

    const ownerP = ChallengeDB.findAll().then(sortChallenges);

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

    const ManageUsers = ()=> {
      if(!this.props.user.admin)
        return null;
      return (
        <Link to="/admin/users" className="btn dropdown-item">
          Manage Users
        </Link> 
      )
    }

    return (
      <div className="ProfileScreen screen">
        <StarGradient />
        <div className="d-flex justify-content-between mb-2">
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
          <MoreMenu menuIcon="bars" direction="dropdown">
            <ManageUsers />
            <button type="button" onClick={this.sendPass} className="btn dropdown-item">
              Reset Password
            </button>         
            <button type="button" onClick={this.signout} className="btn dropdown-item">
                Sign Out
            </button>
          </MoreMenu>
        </div>

        <UploadError />
        <MyChallenges 
          user={this.props.user}
          drafts={this.state.drafts} 
          active={this.state.active}
          pending={this.state.pending}
          past={this.state.past}
          future={this.state.future}
          deleted={this.state.deleted}
          loading={this.state.loadingChallenges} />
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
    <div className="ProfileResponses mt-3">
        <h3 className="border-light border-bottom-1">My Responses</h3>
        <div className="p-2">{CardBody}</div>
    </div>
  )
}

const MyChallenges = (props)=>{


  const header = (<h3 className="border-light border-bottom-1">My Challenges</h3>);
  if(props.loading) {
    return (
      <div className="ProfileChallenges mb-2">
        {header}
        <Spinner />
      </div>
    )
  }

  const Challenge = (c)=>{
    return (
      <div className={`ProfileChallenge`} key={_.uniqueId("challenge_")}>
        <div className="d-flex justify-content-between">
          <div>
            <div className={`badge badge-${c.stage}`}>{c.stage}</div>
            <h6 className="font-weight-bold pb-0">{c.title}</h6>
          </div>
          <div className="d-flex align-items-top">
            <ViewLink challenge={c} {...props} />
            <MoreMenu>
              <EditLink challenge={c} {...props} />
              <DeleteLink challenge={c} {...props} />
              <EditLink challenge={c} {...props} />
            </MoreMenu>
          </div>
        </div>
          <ChallengeMsg challenge={c} />
      </div>
    )
  }

  const drafts = _.map(props.drafts, Challenge);
  const pending = _.map(props.pending, Challenge);
  const active = _.map(props.active, Challenge);
  const past = _.map(props.past, Challenge);
  const future = _.map(props.future, Challenge);
  const deleted = _.map(props.deleted, Challenge);

  return (
    <div className="ProfileChallenges mb-2">
      <div className="p-2">
        {header}
        {active}
        {drafts}
        {pending}
        {future}
        {past}
        {deleted}
      </div>
    </div>
  )
}

const ViewLink = (props) => {
  return <Link className="d-block" to={`/challenge/${props.challenge.id}`}>View</Link>
}

const EditLink = (props) => {
  if(props.challenge.status === ChallengeStatus.DRAFT || props.user.admin)
    return <Link className={`btn btn-link dropdown-item`} to={`/challenge/${props.challenge.id}/edit`}>Edit</Link>
  return null;
}

const DeleteLink = (props) => {
  let params = {};
  let css = "";
  if(props.challenge.stage === "active") {
    params.disabled = "disabled"
    css = "disabled"
  }

  const delChallenge = ()=> {
    props.deleteChallenge(props.challenge.id);
  }

  if(props.challenge.status === ChallengeStatus.DRAFT || props.user.admin) {
    return (
      <button type="button" onClick={delChallenge} className={`btn dropdown-item ${css}`}>
        Delete
      </button> 
    )
  
  }
  
  return null;
}

const ChallengeMsg = (props) => {
  const now = new Date();
  if(props.challenge.status === ChallengeStatus.DRAFT) {
    return (
      <small><strong>Draft</strong> {df.ts(props.challenge.created)}</small>
    )
  }

  if(props.challenge.status === ChallengeStatus.REVIEW) {
    return (
      <small className=""><strong>Under review</strong> {df.ts(props.challenge.modified)}</small>
    )
  }

  if(props.challenge.stage === "active" && now < props.challenge.responseDue) {
    return (
      <small><strong>Current Challenge</strong> {df.range(props.challenge.start, props.challenge.end)}</small>
    )
  }

  if(props.challenge.stage.review === "rating") {
    
    let responseLink = "";
    if(props.challenge.owner.uid === props.user.uid) {
      responseLink = (
        <Link to={`/challenges/${props.challenge.id}/review`}>
          Review resonses and pick owner's choice.
        </Link>
      )
    }
    else if(props.challenge.professor.uid === props.user.uid) {
      responseLink = (
        <Link to={`/challenges/${props.challenge.id}/review`}>
          Review resonses and pick owner's choice.
        </Link>
      )
    }
    else if(!props.user.admin) {
      responseLink = (
        <Link to={`/challenges/${props.challenge.id}/respond`}>Go to my response</Link>
      )
    }

    return (
      <div>
        <small className="d-block"><strong>Current challenge</strong> <em>response due {df.day(props.responseDue)}</em></small>
        {responseLink}
      </div>
      
    )
  }

  if(props.challenge.stage === "future") {
    return (
      <small><strong>Scheduled Challenge</strong> {df.day(props.challenge.start)}</small>
    )
  }

  if(props.challenge.stage === "archive") {
    return (
      <small><strong>Past Challenge</strong> {df.range(props.challenge.start, props.challenge.end)}</small>
    )
  }


  return (
      <small className="text-muted">{props.challenge.stage} {df.range(props.challenge.start, props.challenge.end )}</small>
    )
}



export default ProfileScreen;
