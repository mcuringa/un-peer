import React from 'react';
import { Link } from 'react-router-dom';
import _ from "lodash";
import {ChevronDownIcon} from 'react-octicons';
import db from "../DBTools";
import df from "../DateUtil";

import {ChallengeDB, ChallengeStatus} from "./Challenge.js"
import Modal from "../Modal";
import {snack, SnackMaker} from "../Snackbar";

class ManageChallengesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenges: []};
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
  }


  componentWillMount() {
    ChallengeDB.findAll().then((t)=>{

      t = _.filter(t,c=>c.status !== ChallengeStatus.DRAFT);
      t = _.sortBy(t, c=> c.start);
      t = _.reverse(t);
      this.setState({challenges: t});
    });
  }

  componentWillUnmount() {
    this.props.setAppClass("");
  }

  render() {
    let t = this.state.challenges;
    t = t.map((challenge) => {
      return (
        <ChallengeRow 
          key={challenge.id} 
          challenge={challenge} />
      );
    });
    return (
      <div className="ChallengeListScreen screen">
        <h5 className="">CHALLENGES</h5>
        {t}
      <this.Snackbar />
      </div>
    )
  }
}

const StatusModal = (props)=> {
  return (
    <Modal id="changeStatusModal" 
      title="Challenge status" 
      show={this.props.show}
      onConfirm={props.saveStatus}
      closeHandler={props.close}
      >
      <h5>{props.challenge.title}</h5>
    </Modal>
  )
}


const ChallengeRow = (props) => {
  const challenge = props.challenge;
  const dates = df.range(challenge.start, challenge.end);
  const changeStatus = (status)=> {
    return db.update("/challenges", challenge.id, {status: status} );
  }

  const ProfName = ()=> {
    if(challenge.professor)
      return (<span>{challenge.professor.firstName} {challenge.professor.lastName}</span>)
    return (<em className="text-muted">professor not set</em>)
  }

  return (
    <div className="border-bottom border-light pb-1 mb-3">
      <div className="d-flex align-items-baseline justify-content-between" style={{lineHeight: "1.1em"}}>
        <h5 className="pl-0"><Link to={`/challenge/${challenge.id}/edit`}>{challenge.title}</Link></h5>
        <div className="ChallengeItemMenu">
          <ChallengeMenu challenge={challenge} />
        </div>
      </div>
      <div>
        <strong>Status: </strong><span className={`icon-${challenge.stage}`}>{challenge.stage}</span>
      </div>
      <div className="d-flex">
        <div className="mr-2"><strong>Owner: </strong>{challenge.owner.firstName} {challenge.owner.lastName}</div>
        <div><strong>Professor: </strong><ProfName /></div>
      </div>
      <div className="d-flex">
        <div className="mr-2"><strong>Start: </strong>{df.day(challenge.start)}</div>
        <div><strong>End: </strong>{df.day(challenge.end)}</div>
      </div>
      <div className="d-flex">
        <div className="mr-2"><strong>Response due: </strong>{df.day(challenge.start)}</div>
        <div><strong>Rating due: </strong>{df.day(challenge.start)}</div>
      </div>
    </div>
  )
}

const ChallengeMenu = (props)=> {
  const c = props.challenge;

  const pubProps = {disabled: (c.status == ChallengeStatus.PUBLISHED)?null: true};
  const unpubProps = {disabled: (c.status == ChallengeStatus.REVIEW)?null: true};

  return (
    <MoreMenu>
      <Link className="dropdown-item btn-link" to={`/challenge/${c.id}`}>View Challenge</Link>
      <Link className="dropdown-item btn-link" to={`/challenge/${c.id}/edit`}>Edit Challenge</Link>
      <Link className="dropdown-item btn-link" to={`/challenge/${c.id}/edit/responses`}>Edit Responses</Link>
      <div className="dropdown-divider"></div>
      <h6 className="dropdown-header">CHANGE STATUS</h6>
      <button className="dropdown-item" type="button" {...unpubProps} onClick={props.unpublish}>Unpublish (review)</button>
      <button className="dropdown-item" type="button" {...pubProps} onClick={props.publish}>Publish</button>
      <button className="dropdown-item" type="button" onClick={props.remove}>Delete</button>
      <div className="dropdown-divider"></div>
      <button className="dropdown-item" type="button" onClick={props.changeOwner}>Change Owner</button>
      <button className="dropdown-item" type="button" onClick={props.changeProf}>Change Professor</button>
      <button className="dropdown-item" type="button" onClick={props.changeSchedule}>Change Schedule</button>
    </MoreMenu>
  )

}

const MoreMenu = (props)=> {
  const c = props.challenge;

  return (
    <div className="MoreMenu dropdown dropleft">
      <button type="button" className="MoreIcon btn btn-link text-dark m-0 p-0 icon-secondary" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <KebabVerticalIcon />
      </button>
      <div className="dropdown-menu">
        {props.children}
      </div>
    </div>
  )

}


const KebabVerticalIcon = ()=>{

  const len = 32;
  return (
    <svg width={len} height={len} className="octicon octicon-kebab-vertical" viewBox={`0 0 ${len} ${len}`}>
      <circle className="icon-bg icon-light" cx={len/2} cy={len/2} r={(len/2)} />
      <circle cx={len/2} cy={len * .33} r={1.5} />
      <circle cx={len/2} cy={len/2} r={1.5}  />
      <circle cx={len/2} cy={len * .66} r={1.5} />
    </svg>
  )
}

      // <path fill-rule="evenodd" d="M0 2.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm0 5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm0 5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"></path>

export default ManageChallengesScreen;
