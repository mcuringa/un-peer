import React from 'react';
import { Redirect } from 'react-router-dom'

import {User, Challenge, ChallengeDB} from "./Challenge";
import {
  TextGroup,
  TextInput,
  LoadingSpinner
} from "../FormUtil"

class NewChallengeScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      "id": "",
      "title": "", 
      owner: User,
      loading: false,
      step2: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  componentWillMount() {

  }


  handleChange(e) {

    const k = new String(e.target.id);
    const v = e.target.value;
    let st = {};
    st[e.target.id] = e.target.value;
    this.setState(st);
  }

  submit(e) {
    e.preventDefault();
    this.setState({loading: true});
    let c = Challenge;
    c.owner = User;
    c.title = this.state.title;
    c.id = null;
    ChallengeDB.save(c).then((docRef)=> {
      this.setState({id: docRef.id, step2: true});
    });
  }

  
  render() {
    let hide = (this.state.loading)?" hidden":"";
    if(this.state.step2)
      return <Redirect push to={`/challenge/$(this.state.id)/edit`}/>

    return (
      <form onSubmit={this.submit}>
        <h2>Submit a Challenge</h2>

      
        <TextGroup id="title"
          value={this.state.title} 
          label="Challenge Title" 
          onChange={this.handleChange} 
          required={true} 
          help="First, create a title that describes the challenge. You can change it later."/>

        <TextInput id="id"
          value={ChallengeDB.slug(this.state.title)} 
          placeholder="ID is generated from the title" 
          readonly={true}
          plaintext={true} />

        <button id="createChallengeButton"
                className={"btn btn-block btn-primary" + hide}
                type="button" onClick={this.submit}>
          Create Challenge
        </button>
        <LoadingSpinner loading={this.state.loading} />

      </form>
    );
  }
}

export default NewChallengeScreen;