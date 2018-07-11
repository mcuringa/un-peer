import React from 'react';
import { Link } from 'react-router-dom';
import _ from "lodash";
import df from "../DateUtil";
import db from "../DBTools";
import {ChallengeDB, ChallengeStatus} from "./Challenge.js"
import {snack, SnackMaker} from "../Snackbar";
import LoadingModal from "../LoadingModal";


class ManageChallengesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {challenges: [], loading: true};
    this.sortChallenges = _.bind(this.sortChallenges, this);
    this.setStatus = _.bind(this.setStatus, this);
    
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
  }


  componentWillMount() {
   ChallengeDB.findAll().then((t)=> {
      t = _.filter(t,c=>c.status !== ChallengeStatus.DRAFT && c.status !== ChallengeStatus.DELETE);
      t = this.sortChallenges(t);
      this.setState({challenges: t, loading: false});
    });
  }

  sortChallenges(t) {
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

    return _.orderBy(t, [c=>stageWeight[c.stage],"created"]);
  }

  setStatus(challenge, status) {   
    challenge.status = status;
    challenge.stage = ChallengeDB.getStage(challenge);
    ChallengeDB.save(challenge).then(()=>{this.snack("status change saved")});

    let challenges = this.state.challenges;
    const i = _.findIndex(challenges,c=>c.id === challenge.id );
    challenges[i] = challenge;
    challenges = this.sortChallenges(challenges);
    this.setState({challenges: challenges});

  }

  render() {
    if(!this.props.user.admin)
      return null;

    return (
      <div className="ChallengeListScreen screen">
        <h5 className="">CHALLENGES</h5>
        <ChallengeList user={this.props.user} challenges={this.state.challenges} setStatus={this.setStatus} loading={this.state.loading} />
        <this.Snackbar />
      </div>
    )
  }
}

const ChallengeList = (props)=> {
  if(props.loading)
    return <LoadingModal show={true} />

  let t = props.challenges;

  t = _.map(t, (challenge) => {
    return (
      <ChallengeRow 
        key={challenge.id} 
        user={props.user}
        challenge={challenge}
        setStatus={props.setStatus} />
    )
  })
  return t;
}

const ChallengeRow = (props) => {
  const challenge = props.challenge;

  const ProfName = ()=> {
    if(challenge.professor)
      return (<span>{challenge.professor.firstName} {challenge.professor.lastName}</span>)
    return (<em className="text-muted">professor not set</em>)
  }


  return (
    <div className={`border-bottom border-light pb-1 mb-3`}>
      <div className="d-flex align-items-start justify-content-between" style={{lineHeight: "1.1em"}}>
        <div className="d-flex align-items-start">
          <div className={`rounded-0 badge badge-${challenge.stage}`}>
            {challenge.stage}
          </div>
          <h6 className="pt-0 pb-0 pl-2"><Link to={`/challenge/${challenge.id}/edit`}>{challenge.title}</Link></h6>
        </div>
        <ChallengeMenu {...props}/>
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
  let reportCss = (c.status !== ChallengeStatus.PUBLISHED)?"disabled":"";

  return (
    <div className="btn-group" role="group">
      <button id={`ChallengeMenu_${c.id}`} type="button" className="btn btn-sm btn-secondary-outline dropdown-toggle" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        Options
      </button>
      <div className="dropdown-menu dropdown-menu-right" aria-labelledby={`ChallengeMenu_${c.id}`}>
        <Link  className="dropdown-item btn-link" to={`/challenge/${c.id}`}>View</Link>
        <Link  className="dropdown-item btn-link" to={`/challenge/${c.id}/edit`}>Edit</Link>
        <Link  className="dropdown-item btn-link" to={`/challenge/${c.id}/close`}>Close</Link>
        <Link className={`dropdown-item btn-link ${reportCss}`} to={`/challenge/${c.id}/report`}>Report</Link>
        <Link  className="dropdown-item btn-link" to={`/challenge/${c.id}/edit/responses`}>Responses</Link>
        <StatusMenu {...props} />
      </div>
    </div>
  )
}

const StatusMenu = (props)=> {
  
  const s = props.challenge.status;
  let status = {
    reject: "",
    publish: "",
    delete: ""
  }

  if(s === ChallengeStatus.PUBLISHED) {
    status.publish = "disabled";
    status.delete = "disabled";
    status.reject = "disabled";
  }
  else if(s === ChallengeStatus.DELETE)
    status.delete = "disabled";
  else if(s === ChallengeStatus.REJECT)
    status.reject = "disabled";


  const reject = ()=> { props.setStatus(props.challenge, ChallengeStatus.REJECT); }
  const publish = ()=> { props.setStatus(props.challenge, ChallengeStatus.PUBLISHED); }
  const del = ()=> { props.setStatus(props.challenge, ChallengeStatus.DELETE); }
  const purge = ()=> { 
    db.delete("/challenges", props.challenge.id);
  }


  const PurgeButton = ()=> {

    if(!props.user.su)
      return null;

    return <button className={`dropdown-item`} type="button" onClick={purge}>Purge</button>
  }

  return (
    <div>
      <div className="dropdown-divider"></div>
      <h6 className="dropdown-header">SET STATUS</h6>
      <button className={`dropdown-item btn-link ${status.publish}`} type="button" onClick={publish}>Publish</button>
      <button className={`dropdown-item btn-link ${status.reject}`} type="button" onClick={reject}>Reject</button>
      <button className={`dropdown-item btn-link ${status.delete}`} type="button" onClick={del}>Delete</button>
      <PurgeButton />
    </div>
  )
}


export default ManageChallengesScreen;
