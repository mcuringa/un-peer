import React from 'react';
import _ from "lodash";
import db from "../DBTools";

import $ from "jquery";


class ChooseUser extends React.Component {

  constructor(props) {
    super(props);

    this.termKey = _.uniqueId("term");

    this.state = {
      users: [],
      [this.termKey]: ""
    };

    this.onChange = _.bind(this.onChange, this);
  }

  componentWillMount() {
    db.findAll("/users").then((t)=>{
      this.setState({users: t});
    });
  }

  onChange(e) {
    e.preventDefault();
    this.setState({[e.target.id]: e.target.value});
  }

  render() {

    if(this.props.hide)
      return null;

    const term = this.state[this.termKey];
    const search = ()=> {
      if(!term || term.length === 0)
        return [];
      
      const f = (u)=> {
        const s = (u.email + u.firstName + u.lastName).toLowerCase();
        return s.includes(term.toLowerCase());
      }

      return _.filter(this.state.users, f);
    }

    const results = search();
    const clearAndSelect = (u)=> {
      this.props.selectUser(u);
      this.setState({[this.termKey]: ""});
    }


    if(results.length > 0)  
      $(`#${this.termKey}_results`).show();

    return (
      <div>
        <input className="form-control" data-toggle="dropdown" 
          type="text" 
          id={this.termKey} 
          onChange={this.onChange} 
          placeholder={this.props.placeholder} />
        <SearchResults userList={results} 
          id={`${this.termKey}_results`} 
          selectUser={clearAndSelect} />
      </div>
    );
  }
}

const SearchResults = (props)=> {

  if(_.size(props.userList) === 0)
    $(`#${props.id}`).hide();

  const makeRow = (u)=> {

    const choose = ()=>{ 
      props.selectUser(u);
      $(`#${props.id}`).hide();
    }

    return (
        <button
          id={props.id}
          key={`${props.id}_${u.uid}`}
          type="button" 
          className="dropdown-item" 
          onClick={choose}>
          {u.firstName} {u.lastName} &lt;{u.email}&gt;
        </button>
    )
  }

  const results = _.map(props.userList, makeRow);

  return (
    <div id={props.id} className="dropdown-menu">{results}</div>
  );

}

export default ChooseUser;