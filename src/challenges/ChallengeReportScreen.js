import React from 'react';
import _ from "lodash";
import { ChevronRightIcon, ChevronDownIcon} from 'react-octicons';
import {ChallengeDB} from "./Challenge.js";
import LoadingModal from "../LoadingModal";
import db from "../DBTools";
import ChallengeHeader from "./ChallengeHeader.js";

class ChallengeReportScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msg: "loading challenge",
      sortBy: "firstName"
    };
    this.challengeId = this.props.match.params.id;
  }
  

  componentWillMount() {

    const mergeAll = ()=> {

      let responses = this.state.responses;
      if(responses.length === 0)
        console.log("no responses found", responses.length);

      const c = this.state.challenge;
      const assignments = c.assignments;
      console.log("assignments", assignments);


      
      let users = this.state.users;

      
      let responseMap = _.keyBy(responses, r=>r.user.uid);
      let userMap = _.keyBy(users, "uid");

      if(!assignments || assignments.length === 0) {
        console.log("no assignments found", assignments);
        this.setState({loading: false, users: userMap, responses: responseMap });
        return;
      }



      const fillEmptyRatings = (user) => {
        const mapAssignmentToRating = (response)=> {
          if(!response.ratings[user.uid])
            response.ratings[user.uid] = -1;
        }
        _.each(user.assignments, mapAssignmentToRating);
      }
      const mapAssignments = (user)=> {
        const responseIds = assignments[user.uid];
        const lookupResponse = id=>responseMap[id];
        user.assignments = _.map(responseIds, lookupResponse);
        fillEmptyRatings(user);
      };


      _.each(users, mapAssignments);

      this.setState({loading: false, users: userMap, responses: responseMap });
    }

    const addToState = (key)=> {
      return (val)=>{ this.setState({[key]: val})};
    }
    const afterUser = (t)=> {
      console.log("user lookup done");
      addToState("users")(t);
    }
    const afterChallenge = (t)=> {
      console.log("challenge lookup done");
      addToState("challenge")(t);
    }
    const afterResponse = (t)=> {
      console.log("responses lookup done");
      addToState("responses")(t);
    }

    const userP = db.findAll("users").then(afterUser);
    const challengeP = ChallengeDB.get(this.challengeId).then(afterChallenge);
    const responseP = ChallengeDB.getResponses(this.challengeId).then(afterResponse);

    // const userP = db.findAll("users").then(addToState("users"));
    // const challengeP = ChallengeDB.get(this.challengeId).then(addToState("challenge"));
    // const responseP = ChallengeDB.getResponses(this.challengeId).then(addToState("responses"));
    
    Promise.all([userP,challengeP,responseP]).then(mergeAll);


  }

  render() {

    if(!this.props.user.admin) {
      return (
        <div className="alert alert-secondary m-2" role="alert">
          <h4 className="alert-heading">Access Denied</h4>
          <p>You do not have permission to view this report.</p>
        </div>
      )
    }

    if(this.state.loading)
      return <LoadingModal status="Loading challenge status" show={true} />

    if(!this.state.challenge.assignments) {
      return (
        <div className="alert alert-secondary m-2" role="alert">
          <h4 className="alert-heading">Incomplete Report</h4>
          <p>The report cannot be completed because of insufficient responses.</p>
        </div>
      )
    }


    const SortMenu = ()=> {
      const sorter = (key)=> {
        let rev = false;
        if(key === this.state.sortOrder)
          rev = !this.state.reverse;
        return ()=>{this.setState({sortOrder: key, reverse: rev})};
      }

      const SortIcon = (key)=> {
        if(key !== this.state.sortOrder)
          return "";
        if(this.state.reverse)
          return " ▾";
        return " ▴";
      }

      return (
        <div className="dropdown">
          <button id="SortMenu" className="btn btn-secondary dropdown-toggle" type="button" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
            Sort Order
          </button>
          <div className="dropdown-menu" aria-labelledby="SortMenubutton">
            <div className="dropdown-itme"><button className="btn btn-link" onClick={sorter("firstName")}>First Name {SortIcon("firstName")}</button></div>
            <div className="dropdown-itme"><button className="btn btn-link" onClick={sorter("lastName")}>Last Name {SortIcon("lastName")}</button></div>
            <div className="dropdown-itme"><button className="btn btn-link" onClick={sorter("email")}>Email {SortIcon("email")}</button></div>
          </div>
        </div>
      )
    }

    const Response = (props)=> {
      const r = props.response;

      if(_.isNil(r))
        return <em>No response submitted</em>

      const Rating = (key)=> {
        let rating = r.ratings[key];
        let css = ""
        if(rating === -1) {
          rating = "-";
          css = " text-danger";
        }
        const rater = this.state.users[key];
        return (
          <div className={`d-flex justify-content-start pl-2${css}`} key={`rate_${r.id}_${key}`}>
            <div className="text-right pr-1" style={{width: "2em"}}><small>{rating}</small></div>
            <div><small><UserName user={rater} /></small></div>
          </div>
        )
      }

      let keys = _.keys(r.ratings);
      let ratings = _.map(keys, Rating);
      return (
        <div>
          <div>Response:</div>
          <div className="pl-2"><em>{r.title}</em> (avg: {r.avgRating})</div>
          {ratings}
        </div>
      )
    }

    const Assignment = (response)=> {
      return (
        <div className="pl-2" key={_.uniqueId("assigned")}>
          <small><UserName user={response.user} /></small>
        </div>
      )
    }

    const UserStatus = (u)=> {
      const assignments = _.map(u.assignments, Assignment);
      const id=_.uniqueId("UserRow_");
      return (
        <div key={u.id} className={`ChallengeStatusUser border-bottom border-light mt-2 pt-2 pb-2 text-gray`}>
          <div className={`d-flex justify-content-between clickable`} data-toggle="collapse" data-target={`#${id}`} aria-controls={id}
             aria-expanded={this.props.open}
             aria-label="toggle user report">
            <h5><UserName user={u} /></h5>
            <ChevronRightIcon className="toggle-expand icon-menu" />
            <ChevronDownIcon className="toggle-close icon-menu" />
          </div>
          <div id={id} className="collapse">
            <div className="pl-2">
              <Response response={this.state.responses[u.uid]} />
            </div>
            <div className="pl-2">
              <div>Assigned to rate:</div>
              {assignments}
            </div>
          </div>
        </div>
      )
    }

    const sort = (u)=> {
      const v = u[this.state.sortOrder];
      if(_.isNil(v) || !v.toLowerCase)
        return v;
      return v.toLowerCase();
    }
    let users = _.sortBy(this.state.users, sort);
    if(this.state.reverse)
      users = _.reverse(users);
    const UserList = _.map(users, UserStatus);

    return (
      <div className="ChallengeStatus screen">

        <ChallengeHeader challenge={this.state.challenge} 
          history={this.props.history}
          screenTitle="Challenge Status"
          owner={this.state.challenge.owner} 
          user={this.props.user} />
          <SortMenu />

          {UserList}

      </div>

    )

  }
}

const UserName = (props)=> {
  // const empty = (str)=> {
  //   if(_.isNil(str) || str.length === 0)
  //     return false;
  //   return true;
  // }

  const u = props.user;
  return `${u.firstName} ${u.lastName} <${u.email}>`;
}

export default ChallengeReportScreen;