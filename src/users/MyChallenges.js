import React from 'react';
import _ from "lodash";
import {Link} from "react-router-dom";

import { ChevronLeftIcon } from "react-octicons";



import Modal from "../Modal";
import MoreMenu from "../MoreMenu";
import LoadingModal from "../LoadingModal"
import df from "../DateUtil";

import {ChallengeDB, ChallengeStatus} from "../challenges/Challenge";
import {snack, SnackMaker} from "../Snackbar";



class MyChallengesScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "loading": true,
      challenges: [],

    };

    this.loadChallenges = _.bind(this.loadChallenges, this);
    this.confirmDelete = _.bind(this.confirmDelete, this);
    this.deleteChallenge = _.bind(this.deleteChallenge, this);
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);

  }

  componentWillMount() {
    this.loadChallenges();
  }

  loadChallenges() {


    const sortChallenges = (t)=> {
      const stageWeight = {
         active: 1, 
         rating: 1, 
         review: 1,
        pending: 2,
          draft: 3,
         future: 4,
        archive: 5,
       rejected: 6,
        deleted: 7
      }

      return _.orderBy(t, [c=>stageWeight[c.stage],"created"])
    }

    const filterMine = (c)=> {
      const now = new Date();
      const uid = this.props.user.uid;
      if(c.status === ChallengeStatus.DELETE)
        return false;

      if(c.status === ChallengeStatus.PUBLISHED && c.start < now && c.end > now)
        return true;
      
      if(c.owner.uid === uid || (c.professor && c.professor.uid === uid))
        return true;

      return false;
    }

    ChallengeDB.findAll().then((t)=> {
      t = _.filter(t,filterMine);
      t = sortChallenges(t);
      this.setState({challenges: t, loading: false});
    });

  }

  confirmDelete(challenge) {
    this.setState({delChallenge: challenge})
  }

  deleteChallenge() {
    const delC = this.state.delChallenge;
    delC.status = ChallengeStatus.DELETE;
    ChallengeDB.save(delC).then(()=>{
      this.snack("Challenge deleted");
      let t = this.state.challenges;
      t = _.filter(t, c=>c.id!==delC.id);
      this.setState({delChallenge: false, challenges: t});

    });
  }

  render() {

    if(this.state.loading)
      return <LoadingModal show={true} msg="loading challenges..." />
  

    return (
      <div className="MyChallengesScreen screen">
        <h4 className="border-light border-bottom-1">
          <button className="btn btn-link mr-2 p-0" onClick={this.props.history.goBack}><ChevronLeftIcon /></button>
          My Challenges
        </h4>
        <MyChallenges 
          user={this.props.user}
          deleteChallenge={this.confirmDelete}
          challenges={this.state.challenges}  />
        
        <ConfirmDeleteModal
          challenge={this.state.delChallenge}
          onConfirm={this.deleteChallenge}
          close={()=>{ this.setState({delChallenge: false })} }
        />
        <this.Snackbar />
      </div>
    );
  }
}

const ConfirmDeleteModal = (props)=> {
  
  const title =(props.challenge)?props.challenge.title:"";

  const show = (props.challenge)?true:false;
  return (
    <Modal id="confirmDeleteChallenge" 
      title="Delete Challenge" 
      show={show}
      onConfirm={props.onConfirm}
      closeHandler={props.close}
      >
      Are you sure you want to delete the challenge <strong>{title}</strong>?
    </Modal>
  )
}

const MyChallenges = (props)=>{

  const Challenge = (c)=>{
    return (
      <div className="border-bottom border-light pb-1 mb-3" key={c.id}>
        <div className="d-flex justify-content-between">
          <div className="d-flex align-items-start">
            <div className={`rounded-0 badge badge-${c.stage} mr-1`}>
              {c.stage}
            </div>
            <h6 className="p-0"><Link to={`/challenge/${c.id}/`}>{c.title}</Link></h6>
          </div>
          <div className="ChallengeItemMenu">
            <ChallengeMenu challenge={c} {...props} />
          </div>
        </div>
        <ChallengeMsg challenge={c} {...props} />
      </div>
    )
  }

  const challenges = _.map(props.challenges, Challenge);

  return (
    <div className="ProfileChallenges mb-2">
      {challenges}
    </div>
  )
}

const ChallengeMenu = (props)=>{

  
  const edit = props.challenge.status === ChallengeStatus.DRAFT || props.challenge.status === ChallengeStatus.REJECT;
  const editCss = (edit)?"":"disabled";
  
  const DeleteLink = () => {

    const delChallenge = ()=> {
      props.deleteChallenge(props.challenge);
    }

    return (
      <button type="button" onClick={delChallenge} className={`btn dropdown-item ${editCss}`}>
        Delete
      </button> 
    )
  }
  
  const EditLink = () => {
    return <Link className={`btn btn-link dropdown-item ${editCss}`} to={`/challenge/${props.challenge.id}/edit`}>Edit</Link>
  }

  return (
    <MoreMenu>
      <Link className="dropdown-item" to={`/challenge/${props.challenge.id}`}>View</Link>
      <EditLink {...props} />
      <DeleteLink  {...props} />
    </MoreMenu>
  )
}

const ChallengeMsg = (props) => {
  if(props.challenge.status === ChallengeStatus.PUBLISHED) {
    return (
      <small><strong>Challenge Dates</strong> {df.range(props.challenge.start, props.challenge.end)}</small>
    )
  }

  if(props.challenge.stage.review === "rating" || props.challenge.stage === "respond") {

    if(props.challenge.owner.uid === props.user.uid) {
      return (
        <Link to={`/challenges/${props.challenge.id}/review`}>
          Review responses and pick owner's choice.
        </Link>
      )
    }

    if(props.challenge.professor.uid === props.user.uid) {
      return (
        <Link to={`/challenges/${props.challenge.id}/review`}>
          Review responses and pick expert's choice.
        </Link>
      )
    }

    return (
      <Link to={`/challenges/${props.challenge.id}/respond`}>Go to my response</Link>
    )

  }


  return (
    <small className=""><strong>Last modified</strong> {df.ts(props.challenge.modified)}</small>
  )

}



export default MyChallengesScreen;
