import React from 'react';
import _ from "lodash";
import { Link } from "react-router-dom";

import {ChallengeDB, Challenge} from "./Challenge";
import db from "../DBTools";
import ChallengeHeader from "./ChallengeHeader";
import MoreMenu from "../MoreMenu";
import Modal from "../Modal";
import {snack, SnackMaker} from "../Snackbar";
import Response from "./Response"

class ManageResponsesScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {responses: [], challenge: Challenge};
    this.challengeId = this.props.match.params.id;
    this.deleteResponse = _.bind(this.deleteResponse, this);
    this.setProfChoice = this.setProfChoice.bind(this);
    this.setOwnerChoice = this.setOwnerChoice.bind(this);
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
  }
  
  componentWillMount() {
    ChallengeDB.getResponses(this.challengeId).then(
      (responses)=>{
        const t = _.sortBy(responses, "title");
        this.setState({responses: t})
      }
    );

    ChallengeDB.get(this.challengeId).then(
      (challenge)=>{
        this.setState({challenge: challenge});
      }
    );

  }

  setOwnerChoice(response) {
    let c = this.state.challenge;
    const msg = "Owner's Choice saved";
    c.ownerChoice = response;
    
    ChallengeDB.save(c).then(()=>{
      this.setState({challenge: c});
      this.snack(msg);       
    });
  }

  setProfChoice(response) {
    let c = this.state.challenge;
    const msg = "Instructor's Choice saved";
    c.professorChoice = response;
    ChallengeDB.save(c).then(()=>{
      this.setState({challenge: c});
      this.snack(msg);       
    });
  }

  deleteResponse() {
    const path = `challenges/${this.challengeId}/responses`;
    this.setState({delResponse: null});
    db.delete(path, this.state.delResponse.id).then(()=>{
      ChallengeDB.getResponses(this.challengeId).then(
        (responses)=>{
          const t = _.sortBy(responses, "title");
          this.setState({responses: t})
          this.snack("Response deleted.");
        }
      );
    });
  }

  render() {

    const ownerFeatId = (this.state.challenge.ownerChoice)?this.state.challenge.ownerChoice.id : "";
    const profFeatId = (this.state.challenge.professorChoice)?this.state.challenge.professorChoice.id : "";

    let ResponseList = _.map(this.state.responses, (r, i)=> {
      const deleteResponse = ()=>{
        console.log("delete response context menu called");
        this.setState({delResponse: r});
      }
      const makeOwner = ()=>{
        this.setOwnerChoice(r);
      }
      const makeExpert = ()=>{
        this.setProfChoice(r);
      }
      const menu = (<ResponseMenu 
        challenge={this.state.challenge}
        response={r}
        deleteResponse={deleteResponse} 
        makeOwner={makeOwner} 
        makeExpert={makeExpert} />
      )

      r.avgRating = r.avgRating||0;
      r.ownerChoice = (r.id === ownerFeatId);
      r.profChoice = (r.id === profFeatId);


      return (
        <Response 
          key={_.uniqueId("resp_")}
          challenge={this.state.challenge}
          response={r} 
          profChoice={r.profChoice}
          ownerChoice={r.ownerChoice}
          deleteResponse={deleteResponse}
          makeOwner={makeOwner}
          makeExpert={makeExpert}
          user={this.props.user} 
          showAuthorInfo={true}
          contextMenu={menu}
          />
      );
    });

    const cancelDel = ()=>{this.setState({delResponse: null})};
    const showDelModal = !_.isNil(this.state.delResponse);
    return (
      <div className="ManageResponsesScreen screen">
        <ChallengeHeader id={this.state.challenge.id} 
          challenge={this.state.challenge} 
          owner={this.state.owner} 
          history={this.props.history}
          user={this.props.user}
          hideBack={false} />
        {ResponseList}
        <this.Snackbar />
        <DeleteModal response={this.state.delResponse} show={showDelModal} cancel={cancelDel} confirm={this.deleteResponse} />
      </div>
    );
  }
}


const DeleteModal = (props)=> {
  const title = (props.response)?props.response.title : "";
  return (
    <Modal id="ConfirmDeleteResponse" show={props.show} closeHandler={props.cancel} onConfirm={props.confirm} title="Delete response">
      Really delete <strong>{title}</strong>?
    </Modal>
  )
}

const ResponseMenu = (props)=> {

  return (
    <MoreMenu className="pb-3">
      <Link to={`/admin/response/${props.challenge.id}/${props.response.id}`} className="dropdown-item btn-link">Edit Response</Link>
      <button className="dropdown-item btn-link" onClick={props.deleteResponse}>Delete Response</button>
      <button className="dropdown-item btn-link" onClick={props.makeOwner}>Make owner's choice</button>
      <button className="dropdown-item btn-link" onClick={props.makeExpert}>Make instructor's choice</button>
    </MoreMenu>
  )
}

export default ManageResponsesScreen;
