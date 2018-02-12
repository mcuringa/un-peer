import React from 'react';
import _ from "lodash";
import {CalendarIcon} from 'react-octicons';
import dateFormat from 'dateformat';
import { Link } from 'react-router-dom'
import {User, Challenge, ChallengeDB} from "./Challenge.js"

import FBUtil from "../FBUtil";


class ChallengeEditScreen extends React.Component {
  constructor(props) {
    super(props);
    const id = this.props.match.params.id || "";
    this.state = {
      challenge: Challenge, 
      owner: User
    };
    this.handleChange = this.handleChange.bind(this);
  }

  componentWillMount() {
    const id = this.props.match.params.id;
    ChallengeDB.get(id,(c)=>{
      this.setState({"owner": c.owner});
      this.setState({challenge: c});
    });
  }

  handleChange(e) {
    const c = this.state.challenge;
    c[e.target.id] = e.target.value;
    this.setState({ challenge: c });
  }

  render() {
    const c = this.state.challenge;
    return (
      <div>
        <h3 className="">Challenge Edit Form <img className="float-right" style={{height: "28px"}} src="/img/spinner.gif" /></h3>
        <form>
          <TextGroup id="title" val={c.title} label="Challenge Title" onChange={this.handleChange} />
        </form>
      </div>);
  }
}


const TextGroup = (props)=> {

  return (
  <div className="form-group">
    <label htmlFor={props.id}>{props.label}</label>
    <input type={props.type||'text'} 
           value={props.val} 
           className="form-control" 
           id={props.id} 
           placeholder={props.placeholder}
           onChange={props.onChange} />
    <small id={`${props.id}Help`} className="form-text text-muted">{props.help}</small>
  </div>
  );

};

export default ChallengeEditScreen;