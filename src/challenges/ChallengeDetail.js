import React from 'react';
import _ from "lodash";
import {CalendarIcon} from 'react-octicons';
import dateFormat from 'dateformat';

import FBUtil from "../FBUtil";

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
      console.log("loading challenge...");
      console.log(challenge);
    });
    


  }


  render() {
    // const start = dateFormat(challenge.start, "dd mmm yyyy");
    const start = "foo";
    return (
        <div className="ChallengeDetail" key={this.state.challenge.id}>
        
          <div className="card">
            <div className="StartDate"><CalendarIcon/> {start}</div>
            <h4>{this.state.challenge.title}</h4>
            
            <div className="row">
              <div className="col-5 text-right">Status:</div>
              <div className="col">Active</div>
            </div>
                 
            <div className="row">
              <div className="col-5 text-right">Submitted by:</div>
            </div>
          </div>
          
          <div className="ChallengeDescription">
            <h6>Description</h6>
            <p>{this.state.challenge.prompt}</p>
          </div>

        </div>

      );
  }
}



export default ChallengeDetailScreen;