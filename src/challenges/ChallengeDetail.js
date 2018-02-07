import React from 'react';
import _ from "lodash";
import {CalendarIcon} from 'react-octicons';
import dateFormat from 'dateformat';

import FBUtil from "../FBUtil";

const df = (d)=> dateFormat(d, "dd mmm yyyy");

class ChallengeDetailScreen extends React.Component {
  constructor(props) {
    super(props);
    const id = this.props.match.params.id;
    this.state = {challenge: {id: id}};
    let db = FBUtil.connect();
    let challenge = {};
    db.collection("challenges").doc(id).get().then((doc) => {
      challenge.id = id;
      challenge = doc.data();
      this.setState({"challenge": challenge});

    });
    


  }


  render() {

    return (
        <div className="ChallengeDetail" key={this.state.challenge.id}>
        
          <div className="card">
            <div className="StartDate"><CalendarIcon/> {df(this.state.challenge.start)}</div>
            <h4>{this.state.challenge.title}</h4>
            
            <div className="row">
              <div className="col-5 text-right">Status:</div>
              <div className="col">Active</div>
            </div>
                 
            <div className="row">
              <div className="col-5 text-right">Submitted by:</div>
            </div>
            <ChallengeButtons />  
          </div>
          <div className="ChallengeDescription">
            <h6>Description</h6>
            <p>{this.state.challenge.prompt}</p>
          </div>

        </div>


      );
  }
}
const ChallengeButtons = (props) => {
  return (
    <div className="btn-toolbar" role="toolbar" aria-label="Toolbar with button groups">
      <div className="btn-group mr-2" role="group" aria-label="First group">
        <button type="button" className="btn btn-primary">Info</button>  
        <button type="button" className="btn btn-primary">Media</button>
        <button type="button" className="btn btn-primary">Respond</button>
        <button type="button" className="btn btn-primary">Rate</button>
        <button type="button" className="btn btn-primary" disabled="disabled">Edit</button>
      </div>
    </div>);
}


export default ChallengeDetailScreen;