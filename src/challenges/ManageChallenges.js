import React from 'react';
import { Link } from 'react-router-dom';
import _ from "lodash";
import {ChevronDownIcon} from 'react-octicons';
import db from "../DBTools";
import df from "../DateUtil";
import MoreMenu from "../MoreMenu";
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
    ChallengeDB.findAll().then((t)=> {

      const stageWeight = {
         active: 1, 
         rating: 1, 
          draft: 2,
         review: 3,
         future: 4,
        archive: 5,
        deleted: 6
      }
      const compareChallenges = (a,b)=>{
        if(stageWeight[a.stage] < stageWeight[b.stage]) 
          return -1;
        if(stageWeight[a.stage] > stageWeight[b.stage]) 
          return 1;
        if(a.created < b.created)
          return -1;
        if(a.created > b.created)
          return 1;
        return 0;
      }

      t = _.filter(t,c=>c.status !== ChallengeStatus.DRAFT);
      t.sort(compareChallenges);
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
      <div className="d-flex align-items-start justify-content-between" style={{lineHeight: "1.1em"}}>
        <div className="d-flex align-items-start">
          <div className={`rounded-0 badge badge-${challenge.stage}`}>
            {challenge.stage}
          </div>
          <h6 className="pt-0 pb-0 pl-2"><Link to={`/challenge/${challenge.id}/edit`}>{challenge.title}</Link></h6>
        </div>
        <div className="ChallengeItemMenu">
          <ChallengeMenu challenge={challenge} />
        </div>
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
      <Link className="dropdown-item btn-link" to={`/challenge/${c.id}/edit`}>Close Challenge</Link>
      <Link className="dropdown-item btn-link" to={`/challenge/${c.id}/edit/responses`}>Edit Responses</Link>
      <div className="dropdown-divider"></div>
      <StatusMenu {...props} />
    </MoreMenu>
  )
}

const StatusMenu = (props)=> {
  
  const s = props.challenge.status;
  let status = {
    reject: "",
    publish: "",
    delete: ""
  }

  if(s === ChallengeStatus.PUBLISHED)
    status.publish = "disabled";
  else if(s === ChallengeStatus.DELETE)
    status.delete = "disabled";
  else if(s === ChallengeStatus.REJECT)
    status.reject = "disabled";


  const reject = ()=> { props.setStatus(props.challenge, ChallengeStatus.REJECT); }
  const publish = ()=> { props.setStatus(props.challenge, ChallengeStatus.PUBLISHED); }
  const del = ()=> { props.setStatus(props.challenge, ChallengeStatus.DELETE); }

  return (
    <div>
      <h6 className="dropdown-header">CHANGE STATUS</h6>
      <button className={`dropdown-item ${status.publish}`} type="button" onClick={publish}>Publish</button>
      <button className={`dropdown-item ${status.reject}`} type="button" onClick={reject}>Reject</button>
      <button className={`dropdown-item ${status.delete}`} type="button" onClick={del}>Delete</button>
    </div>
  )
}


export default ManageChallengesScreen;
