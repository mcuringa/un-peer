import React from 'react';
import { Redirect } from 'react-router-dom'

import {Challenge, ChallengeDB} from "./Challenge";
import {
  TextGroup,
  TextAreaGroup,
  LoadingSpinner
} from "../FormUtil"

class NewChallengeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      "id": "",
      "title": "", 
      "prompt": "", 
      loading: false,
      validationError: false,
      step2: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.submit = this.submit.bind(this);
  }

  handleChange(e) {
    const title = this.state.title.trim();
    if(title.length > 0) {
      this.setState({validationError: false,});
    }
    
    let st = {};
    st[e.target.id] = e.target.value;
    this.setState(st);
  }

  submit(e) {

    const title = this.state.title.trim();
    if(title.length === 0) {
      this.setState({validationError: true,});
      return;
    }
    const owner = {
      uid: this.props.user.uid,
      firstName: this.props.user.firstName,
      lastName: this.props.user.lastName,
      name: `${this.props.user.firstName} ${this.props.user.lastName}`,
      email: this.props.user.email
    }
    e.preventDefault();
    this.setState({loading: true});
    let c = Challenge;
    c.owner = owner;
    c.title = this.state.title;
    c.prompt = this.state.prompt;
    c.id = null;
    ChallengeDB.save(c).then((docRef)=> {
      this.setState({id: docRef.id, step2: true});
    });
  }

  
  render() {
    let hide = (this.state.loading)?" d-none":"";
    if(this.state.step2)
      return <Redirect push to={`/challenge/${this.state.id}/edit`}/>

    return (
      <form onSubmit={this.submit}>
        <h2>Submit a Challenge</h2>

      
        <TextGroup id="title"
          value={this.state.title} 
          label="Challenge Title" 
          onChange={this.handleChange} 
          required={true} 
          validationErrorMsg="Please enter a title for your challenge. You can change it later."
          showError={this.state.validationError}/>

          <TextAreaGroup id="prompt"
            value={this.state.prompt}
            label=""
            placeholder="Enter a short description of your challenge."
            rows="4"
            onChange={this.handleChange} />

        <button id="createChallengeButton"
                className={"btn btn-block btn-primary mt-2" + hide}
                type="button" onClick={this.submit}>
          Create Challenge
        </button>
        <LoadingSpinner loading={this.state.loading} />

      </form>
    );
  }
}

export default NewChallengeScreen;
