import React from 'react';
import { Link } from 'react-router-dom'
import _ from "lodash";
import { TrashcanIcon, ChevronLeftIcon } from "react-octicons";

import {Challenge, ChallengeDB, ChallengeStatus} from "./Challenge";
import {
  TextGroup,
  TextAreaGroup,
  DatePicker,
  TimePicker,
  StatusIndicator
} from "../FormUtil"
import df from "../DateUtil";
import Modal from "../Modal";
import LoadingModal, {Spinner} from "../LoadingModal";
import {MediaUpload} from "../MediaManager";
import {snack, SnackMaker} from "../Snackbar";
import ChooseUser from "../users/ChooseUser";

class NewChallengeScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      goToEdit: false
    };

    this.handleChange = _.bind(this.handleChange, this);
    this.handleStartDateChange = _.bind(this.handleStartDateChange, this);
    this.handleDateTime = _.bind(this.handleDateTime, this);
    this.handleUpload = _.bind(this.handleUpload, this);
    this.submit = _.bind(this.submit, this);
    this.clearField = _.bind(this.clearField, this);
    this.confirmReview = _.bind(this.confirmReview, this);
    this.submitReview = _.bind(this.submitReview, this);
    this.cancelReview = _.bind(this.cancelReview, this);
    this.validate = _.bind(this.validate, this);
    this.selectUser = _.bind(this.selectUser, this);
    this.mountNewChallenge = _.bind(this.mountNewChallenge, this);
    this.mountExistingChallenge = _.bind(this.mountExistingChallenge, this);

    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
  }


  mountNewChallenge() {
    console.log("mounting new challenge");
    const owner = {
      uid: this.props.user.uid,
      firstName: this.props.user.firstName,
      lastName: this.props.user.lastName,
      name: `${this.props.user.firstName} ${this.props.user.lastName}`,
      email: this.props.user.email
    };
    let challenge = new Challenge();
    challenge.owner = owner;
    challenge.id = null;
    console.log("challenge.title");
    console.log(challenge.title);
      this.setState({
        challenge: challenge,
        loading: false,
        confirmReview: false
      });
  }

  mountExistingChallenge(id) {
    console.log("mounting existing challenge");
    ChallengeDB.get(id).then((c)=> {
      if(c.status === ChallengeStatus.REJECT && c.owner && this.props.user.uid === c.owner.uid)
        c.status = ChallengeStatus.DRAFT;

      const underReview = c.status !== ChallengeStatus.DRAFT && !this.props.user.admin;
      this.setState({
        challenge: c,
        loading: false,
        confirmReview: false,
        underReview: underReview
      });
    });
  }

  componentWillMount() {
    const id = this.props.match.params.id;
    if(id)
      this.mountExistingChallenge(id);
    else
      this.mountNewChallenge();
  }

  selectUser(u, key) {
    let c = this.state.challenge;
    c[key] = u;
    this.setState({ challenge: c, dirty: true });
  }

  handleUpload(src, key) {

    let c = this.state.challenge;
    c[key] = src;

    this.setState({challenge: c, uploading: false});    
    
  }

  clearField(key) { 
    let c = this.state.challenge;
    c[key] = "";
    this.setState({ challenge: c, dirty: true });
  }

  handleChange(e) {

    let c = this.state.challenge;
    c[e.target.id] = e.target.value;
    this.setState({ challenge: c, dirty: true });
  }

  handleDateTime(dateId, timeId) {
    let c = this.state.challenge;
    const day = document.getElementById(dateId).value;
    const time = document.getElementById(timeId).value;
    const date = new Date(day + " " + time);
    c[dateId] = date;
    // console.log(day);
    // console.log(time);

    if(dateId === "start")
      this.handleStartDateChange(date)
    else {
      if(date > c.end)
        c.end = date;
      this.setState({ challenge: c, dirty: true });
    }
  }


  handleStartDateChange(date) {
    let c = this.state.challenge;
    const dayInMillis = 1000 * 60 * 60 * 24;

    c.responseDue = new Date(date.getTime() + dayInMillis * 5);
    c.ratingDue = new Date(date.getTime() + dayInMillis * 7);
    c.end = new Date(date.getTime() + dayInMillis * 8);

    this.setState({ challenge: c, dirty: true });
  }

  validate(challenge) {
    // console.log("status");
    // console.log(this.state.challenge.status);
    let form = document.getElementById("ChallengeForm");
    form.checkValidity();

    const req = (s)=>{return _.isString(s) && s.trim().length > 0;};

    let c = this.state.challenge;
    if(c.status === ChallengeStatus.DRAFT && req(c.title))
      return true;

    if(this.props.user.admin)
      return true;

    return req(c.challengeVideo) && req(c.prompt);
  }

  confirmReview() {
    let c = this.state.challenge;
    c.status = ChallengeStatus.REVIEW;
    this.setState({ challenge: c });

    const valid = this.validate(c);
    if(!valid) {
      this.setState({isValidated: true });
      console.log("not valid");
      return;
    }

    this.setState({ confirmReview: true });
    console.log("show modal");
  }

  submitReview() {
    console.log("submitting review");
    let challenge = this.state.challenge;
    challenge.status = ChallengeStatus.REVIEW;

    this.setState({saving: true});
    const isNew = !challenge.id;
    ChallengeDB.save(challenge).then((c)=> {
      this.snack("Challenge saved");
      this.setState({isValidated: false, challenge:c, saving: false, dirty: false, underReview: true});
      
      if(isNew)
        this.setState({id: c.id, goToEdit: true, underReview: true});
    });
  }

  cancelReview() {
    let challenge = this.state.challenge;
    challenge.status = ChallengeStatus.DRAFT;
    this.setState({ challenge:challenge, confirmReview: false });
  }

  submit(e) {

    let challenge = this.state.challenge;
    if(e) {
      if(e.target.id === "SaveDraftBtn"){
        challenge.status = ChallengeStatus.DRAFT;
        this.setState({ challenge: challenge});
      }

      e.preventDefault();
      e.stopPropagation();
    }
    
    if(!this.validate()) {
      this.setState({isValidated: true });
      this.snack("Fix errors before saving.");
      return;
    }

    this.setState({saving: true});
    const isNew = !challenge.id;
    ChallengeDB.save(challenge).then((c)=> {
      this.snack("Challenge saved");
      this.setState({isValidated: false, saving: false, dirty: false});
      
      if(isNew)
        this.setState({id: c.id, goToEdit: true});
    });
  }

  render() {
    if(this.state.loading)
      return <LoadingModal show={true} />

    if(this.state.goToEdit) {
      this.setState({goToEdit: false})
      this.props.history.push(`/challenge/${this.state.id}/edit`);
    }

    if(this.state.underReview) {
      return (
        <UnderReview
          challenge={this.state.challenge}
          user={this.props.user}
        />
      )
    }

       

    let c = this.state.challenge;
    const draft = this.state.challenge.status === ChallengeStatus.DRAFT;
    const review = this.state.challenge.status === ChallengeStatus.REVIEW;
    const admin = this.props.user.admin;
    
    const validationClass = (this.state.isValidated)?"was-validated":"needs-validation";
    const submitDraft = ()=> {
      c.status = ChallengeStatus.DRAFT;
      this.setState({challenge: c});
      this.submit();
    }

    return (
      <div className="ChallengeEditForm screen">
        <If p={(draft || review) && !admin}>
          <h2>Submit a Challenge</h2>
        </If>
        <If p={admin}>
          <FormHeader 
            challenge={this.state.challenge} 
            dirty={this.state.dirty}
            history={this.props.history}
          />
        </If>


        <form id="ChallengeForm" className={validationClass} noValidate onSubmit={this.submit}>
          
          <If p={draft || review || admin}>
            <BasicFields 
              user={this.props.user}
              challenge={this.state.challenge}
              handleChange={this.handleChange}
              requireAll={review && !admin}
            />
            <ChallengeVideoFields
              user={this.props.user}
              challenge={this.state.challenge}
              handleChange={this.handleChange}
              handleUpload={this.handleUpload}
              clearField={this.clearField}
              requireAll={review && !admin}
            />
          </If>

          <If p={admin && this.state.challenge.id}>
            <label className="mt-2 pb-0 mb-0">Video thumbnail</label>
            <MediaUpload id="challengeVideoPoster" 
              media="img"
              path={c.id}
              url={c.challengeVideoPoster}
              handleUpload={this.handleUpload}
              placeholder="upload challenge video thumbnail"
              clearMedia={this.clearField}
            />
            <hr />
            <ChooseProf challenge={this.state.challenge}
              clearProfessor={()=>{this.clearField("professor");}}
              selectUser={this.selectUser} />

            <ChooseOwner challenge={this.state.challenge}
              clearOwner={()=>{this.clearField("owner");}}
              selectUser={this.selectUser} />
            <hr />
            <StatusSelect
              challenge={this.state.challenge}
              handleChange={this.handleChange}
            />
            <hr />
            <DatePicker id="start"
              value={c.start}
              label="challenge start"
              onChange={_.partial(this.handleDateTime, "start", "startTime")} />
            <TimePicker id="startTime"
              value={c.start}
              onChange={_.partial(this.handleDateTime, "start", "startTime")} />

            <DatePicker id="responseDue"
              value={c.responseDue}
              label="response due"
              onChange={_.partial(this.handleDateTime, "responseDue", "responseDueTime")} />
            <TimePicker id="responseDueTime"
              value={c.responseDue}
              onChange={_.partial(this.handleDateTime, "responseDue", "responseDueTime")} />


            <DatePicker id="ratingDue"
              value={c.ratingDue}
              label="rating due"
              onChange={_.partial(this.handleDateTime, "ratingDue", "ratingDueTime")} />
            <TimePicker id="ratingDueTime"
              value={c.ratingDue}
              onChange={_.partial(this.handleDateTime, "ratingDue", "ratingDueTime")} />

            <DatePicker id="end"
              value={c.end}
              label="challenge end"
              onChange={_.partial(this.handleDateTime, "end", "endTime")} />

            <TimePicker id="endTime"
              value={c.end}
              onChange={_.partial(this.handleDateTime, "end", "endTime")} />

          </If>

          <If p={admin}>
            <div className="d-flex justify-content-end">
              <SaveButton 
                saving={this.state.saving} 
                uploading={this.state.uploading} 
                save={this.submit}
              />
            </div>
          </If>
          <If p={!admin}>
            <SubmitChallengeButtons
              saving={this.state.saving} 
              uploading={this.state.uploading} 
              challenge={this.state.challenge}
              user={this.props.user}
              submit={submitDraft}
              review={this.confirmReview}
            />
          </If>
        </form>



        <ReviewModal 
          show={this.state.confirmReview && this.validate()}
          onConfirm={this.submitReview}
          close={this.cancelReview}
          user={this.props.user}
        />
        <this.Snackbar />
      </div>
    );
  }
}


const If = (props)=> {
  if(!props.p)
    return null;
  return props.children;
}

const StatusSelect = (props)=> {
  const c = props.challenge;
  return (
    <div className="form-group">
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text">Set Status</span>
        </div>
        <select id="status" value={c.status} className="custom-select" onChange={props.handleChange}>
          <option value={ChallengeStatus.DRAFT}>draft</option>
          <option value={ChallengeStatus.REVIEW}>review</option>
          <option value={ChallengeStatus.REJECT}>rejected</option>
          <option value={ChallengeStatus.PUBLISHED}>published</option>
          <option value={ChallengeStatus.ARCHIVED}>archive</option>
        </select>
      </div>
    </div>
  )

}


const ReviewModal = (props)=> {

  return (
    <Modal id="confirmSendForReview" 
      title="Submit for review" 
      show={props.show}
      onConfirm={props.onConfirm}
      closeHandler={props.close}
      >
      Please click <strong>OK</strong> to submit your challenge for review.
      You will hear back shortly from the course instructors after they review your challenge.
    </Modal>
  )
}


const BasicFields = (props)=> {
  const c = props.challenge;
  return (
    <div id="BasicChallengeFormFields">
      <TextGroup id="title"
        value={c.title} 
        placeholder="Challenge Title" 
        onChange={props.handleChange} 
        required={true} 
        validationErrorMsg="Please enter a title for the challenge."
        />

      <TextAreaGroup id="prompt"
        value={c.prompt}
        label=""
        required={props.requireAll} 
        validationErrorMsg="You must write a challenge description."
        placeholder="Write a short description of the challenge."
        rows="4"
        onChange={props.handleChange} />
      
    </div>
  )
}

const ChallengeVideoFields = (props)=> {
  const c = props.challenge;
  if(_.isNil(c.id) || !c.id)
    return null;

  return (
    <div>      
      <label className="d-block pb-0 mb-1">Challenge Video</label>
      <MediaUpload id="challengeVideo" 
        media="video"
        path={c.id}
        url={c.challengeVideo}
        required={props.requireAll} 
        handleUpload={props.handleUpload}
        clearMedia={props.clearField}
        maxFileSize={80*1000*1000}
        validationErrorMsg={"You must upload a challenge video before you can publish."}
      />
      <small className="d-block mb-2">Upload a short (3-6 minute) video which describes the challenge.</small>
    </div>
  )
}



const ChooseOwner = (props)=> {
  const c = props.challenge;
  const choose = (u)=>{
    props.selectUser(u, "owner")
  }
  const Owner = (c.owner && c.owner.email)? (
    <div className="mt-2">
      <span className="badge border">
        {c.owner.firstName} {c.owner.lastName} &lt;{c.owner.email}&gt;
        <button type="button" className="btn btn-link mt-1 p-0 ml-2 mr-1" onClick={props.clearOwner}>
          <TrashcanIcon className="icon-secondary" />
        </button>
      </span>
    </div>
  ): (
    <div>
      <ChooseUser label="Choose owner" selectUser={choose} placeholder="search the users" />
      <small className="text-muted">Choose a user who will be the owner of this challenge.</small>
    </div>
  );

  return (
    <div className="form-group">
      <label>Challenge Owner</label>
      {Owner}
      
    </div>
  )
}


const ChooseProf = (props)=> {
  const c = props.challenge;
  const choose = (u)=>{
    props.selectUser(u, "professor");
  }
  const Prof = (c.professor && c.professor.email)?
    (
      <div className="mt-2">
        <span className="badge border">
          {c.professor.firstName} {c.professor.lastName} &lt;{c.professor.email}&gt;
          <button type="button" className="btn btn-link mt-1 p-0 ml-2 mr-1" onClick={props.clearProfessor}>
            <TrashcanIcon className="icon-secondary" />
          </button>
        </span>
      </div>
    ):
    (
      <div>
        <ChooseUser label="Choose professor" selectUser={choose} placeholder="search for professor" />
        <small className="text-muted">Choose the professor who will submit a video response to this challenge.</small>
      </div>
    );
  return (
    <div className="form-group">
      <label>Professor</label>
      {Prof}
      
    </div>
  )
}



const SaveButton = (props)=> {

  const label = props.label || "save";
  let labelCss = "d-block";
  let save = props.save;
  if(props.saving || props.uploading) {
    save = null;
    labelCss = "d-none";
  }

  return (
    <button type="button" 
      className={`btn btn-secondary mr-1`} 
      onClick={save}>

      <Spinner className="spinner-sm" show={props.saving || props.uploading} />
      <div className={labelCss}>{label}</div>
    </button>
  )
}



const SubmitChallengeButtons = (props)=> {
  if(_.isNil(props.challenge.id) || !props.challenge.id)
    return <NextStepButton {...props} />;
 
  return (

    <div className="d-flex justify-content-end mt-2">
      <SaveButton 
        label="save draft" 
        save={props.submit}
        saving={props.saving}
        uploading={props.uploading}
      />
      <button type="button" 
        onClick={props.review} 
        className="btn btn-secondary">
        Submit for review
      </button>
    </div>
  )
}

const NextStepButton = (props)=> {
 
  return (

    <div className="d-flex justify-content-end mt-2">
      <SaveButton 
        label="continue" 
        save={props.submit}
        saving={props.saving}
        uploading={props.uploading}
      />
    </div>
  )
}





const FormHeader = (props)=>
{
  const c = props.challenge;
  const title = "Edit Challenge";
  return (
    <div className="position-relative no-Screen-padding">
      <div className="ChallengeEditHeader">
        <div className="inner d-flex align-items-center justify-content-between">
          <h4 className="p-1">
            <button className="btn btn-link mr-2 p-0" onClick={props.history.goBack}><ChevronLeftIcon /></button>
            {title}
          </h4>
          <StatusIndicator className="pr-2" dirty={props.dirty} loading={false} />
        </div>
      </div>
      <div className="ChallengeMetaData border-light border-bottom mb-3" style={{paddingTop: "40px"}}>
        <div className="small text-muted">Owner: {c.owner.firstName} {c.owner.lastName}</div>
        <small className="text-muted"><tt>created: {df.ts(c.created)} | </tt></small>
        <small className="text-muted"><tt>modified: {df.ts(c.modified)}</tt></small>
      </div>
    </div> );
}


const UnderReview = (props)=> {

  return (
    <div id="UnderReview" className="card border-dark mt-3">
      <div className="card-header"><h4>Challenge Submitted</h4></div>
      <div className="card-body">
        <p className="card-text">
          <strong>Thank you for submitting your challenge!</strong> It is now under review
          by the course instructors.
        </p>
      </div>
      <div className="card-footer">
        <Link className="btn btn-secondary"
          to="/">Go Home</Link>
      </div>
    </div>
  );
}



export default NewChallengeScreen;
