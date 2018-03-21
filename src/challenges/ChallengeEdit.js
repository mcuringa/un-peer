import React from 'react';
import _ from "lodash";
import {XIcon} from "react-octicons";
import { Redirect } from 'react-router-dom';


import {Challenge, ChallengeDB, ChallengeStatus} from "./Challenge.js"
import FBUtil from "../FBUtil";
import df from "../DateUtil";

import {
  TextGroup,
  DatePicker,
  TextAreaGroup,
  StatusIndicator,
  VideoUploadImproved,
  ImageUpload
} from "../FormUtil";

import {UploadProgress, formatFileSize} from "../MediaManager";
import ChooseUser from "../users/ChooseUser";
import Modal from "../Modal";
import Snackbar from "../Snackbar";
import Accordion from "../Accordion";

class ChallengeEditScreen extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      challenge: Challenge, 
      owner: {displayName: props.user.displayName, email: props.user.email, id: props.user.uid},
      loading: true,
      uploading: false,
      dirty: false,
      uploadStatus: "no upload running",
      showSnack: false,
      snackMsg: "",
      undoClear: {}
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleChange.bind(this);
    this.handleStartDateChange = this.handleStartDateChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.handleUpload = this.handleUpload.bind(this);
    this.autoSave = this.autoSave.bind(this);
    this.autoSave = _.debounce(this.autoSave, 2000);
    this.clearField = this.clearField.bind(this);
    this.selectProfessor = _.bind(this.selectProfessor, this);
    this.selectOwner = _.bind(this.selectOwner, this);
    this.submitForReview = _.bind(this.submitForReview, this);
    this.snack = _.bind(this.snack, this);
    this.snack = _.throttle(this.snack, this.snackTime);
    this.save = _.bind(this.save, this);
  }

  snack(msg, showUndo) {

    const p = (resolve, reject)=>
    {
      const clear = ()=> {
        this.setState({
          showSnack: false,
          snackMsg: "",
          snackUndo: null
        });
      }
      const over = ()=> {
        clear();
        resolve();
      }

      const undo = ()=> {
        clear();
        reject();
      }

      this.setState({
        showSnack: true,
        snackMsg: msg,
        showUndo: showUndo,
        snackUndo: undo,
        snackOver: over
      });      
    }

    return new Promise(p);

  }
  clearField(key, msg) { 
    let c = this.state.challenge;
    c[key] = "";
    this.setState({ challenge: c, dirty: true });
    this.autoSave();
  }

  componentWillMount() {
    const id = this.props.match.params.id;
    ChallengeDB.get(id).then((c)=>{

      this.setState({
        owner: c.owner,
        challenge: c,
        loading: false
      });
    });
  }

  autoSave() {
    // not enabled
    return;
  }

  save() {
    console.log("saving");

    this.setState({loading: true});
    this.snack("saving...");
    ChallengeDB.save(this.state.challenge)
    .then(()=>{
      this.setState({loading: false, dirty: false});
      this.snack("saved");
    });
  }

  handleSubmit(e) {
    this.autoSave();
    e.preventDefault();
  }

  
  handleUpload(e) {

    let c = this.state.challenge;
    let file = e.target.files[0];
    const key = e.target.id;

    if(key === "video")
      this.snack("Uploading video");
    else if(key === "videoPoster")
      this.snack("Uploading thumbnail image");


    this.setState({dirty: true, loading: true, uploading: true});

    const pctKey = key+"Pct";
    const msgKey = key+"Status";
    
    const succ = (task)=> {
      this.snack("Upload complete");
      this.setState({
        [pctKey]: "",
        [msgKey]: 0,
        loading: false,
        uploading: false
      });

      c[key] = task.snapshot.downloadURL;
      this.setState({challenge: c});
      // this.autoSave();
    }

    const watch = (snapshot)=> {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      const xfer = formatFileSize(snapshot.bytesTransferred, true);
      const total = formatFileSize(snapshot.totalBytes, true);

      this.setState( {
        [pctKey]: progress, 
        [msgKey]: `${xfer} of ${total}`
      });
    }

    const err = (e)=>{
      console.log(e);
      this.snack("Upload failed");
      this.setState({
        [msgKey]: "Upload failed: " + e
      });
    }

    FBUtil.uploadMedia(file, c.id, watch, succ, err);
  }


  selectProfessor(u) {
    let c = this.state.challenge;
    c.professor = u;
    this.setState({ challenge: c, dirty: true });
    this.autoSave();
  }

  selectOwner(u) {
    let c = this.state.challenge;
    c.owner = u;
    this.setState({ challenge: c, dirty: true, owner: u });
    this.autoSave();
  }

  handleChange(e) {

    let c = this.state.challenge;
    c[e.target.id] = e.target.value;
    this.setState({ challenge: c, dirty: true });
    this.autoSave();
  }

  handleDateChange(e) {
    let c = this.state.challenge;
    const date = ChallengeDB.parseDateControlToUTC(e.target.value);
    c[e.target.id] = date;

    if(date > c.end)
      c.end = date;

    this.setState({ challenge: c, dirty: true });

    this.autoSave();
  }

  handleStartDateChange(e) {
    let c = this.state.challenge;
    const dayInMillis = 1000 * 60 * 60 * 24;
    const date = ChallengeDB.parseDateControlToUTC(e.target.value);

    c.start = date;
    c.responseDue = new Date(date.getTime() + dayInMillis * 5);
    c.ratingDue = new Date(date.getTime() + dayInMillis * 7);
    c.end = new Date(date.getTime() + dayInMillis * 8);

    this.setState({ challenge: c, dirty: true });

    this.autoSave();
  }

  submitForReview() {
    let c = this.state.challenge;
    c.status = ChallengeStatus.REVIEW;
    this.setState({ challenge: c, dirty: true  });
    this.save();
    this.setState({showThankYou:true});
  }

  render() {
    const c = this.state.challenge;
    const statusOptions = { };
    statusOptions[ChallengeStatus.DRAFT] = "draft";
    statusOptions[ChallengeStatus.REVIEW] = "review";
    statusOptions[ChallengeStatus.PUBLISHED] = "published";
    statusOptions[ChallengeStatus.ARCHIVED] = "archived";

    const hasEditRights = this.props.user.admin || 
      (c.owner && this.props.user.uid === c.owner.uid && (c.status === ChallengeStatus.DRAFT || c.status === ChallengeStatus.REVIEW));

    if(!this.state.loading && (this.state.goHome || !hasEditRights)) //send them home
      return <Redirect push to="/" />

    return (
      <div className="ChallengeEdit screen">
        <FormHeader challenge={c} owner={this.state.owner} loading={this.state.loading} dirty={this.state.dirty} />
        <form className="mt-2" onSubmit={(e)=>{e.preventDefault();}}>
          
          <BasicFields 
            user={this.props.user}
            challenge={c} 
            onChange={this.handleChange}
            pct={this.state.videoPct} 
            msg={this.state.videoStatus} 
            clearVideo={()=>{this.setState({confirmClearVideo:true})}}
            handleUpload={this.handleUpload} />



          <Accordion id="AdvancedFields" hide={!this.props.user.admin} header="Advanced">
            <ImageUpload 
              id="videoPoster"
              label="Video thumbnail"
              pct={this.state.videoPosterPct} 
              img={c.videoPoster} 
              onChange={this.handleUpload}
              clearImage={()=>{this.clearField("videoPoster");}}
              help="Upload a custom thumbnail image that users will see while your video loads, before they press play."
            />

            <ChooseProf challenge={this.state.challenge}
              clearProfessor={()=>{this.clearField("professor");}}
              selectUser={this.selectProfessor} />

            <ChooseOwner challenge={this.state.challenge}
              clearOwner={()=>{this.clearField("owner");}}
              selectUser={this.selectOwner} />
          </Accordion>

          <Accordion id="ScheduleFields" hide={!this.props.user.admin} header="Schedule">
            <div className="form-group">
              <div className="input-group mb-3">
                <div className="input-group-prepend">
                  <span className="input-group-text">Set Status</span>
                </div>
                <select id="status" value={c.status} className="custom-select" onChange={this.handleChange}>
                  <option value={ChallengeStatus.DRAFT}>draft</option>
                  <option value={ChallengeStatus.REVIEW}>review</option>
                  <option value={ChallengeStatus.PUBLISHED}>published</option>
                  <option value={ChallengeStatus.ARCHIVED}>archive</option>
                </select>
              </div>
            </div>
            
            <DatePicker id="start"
              value={c.start}
              label="challenge start"
              onChange={this.handleStartDateChange} />

            <DatePicker id="responseDue"
              value={c.responseDue}
              label="response due"
              onChange={this.handleDateChange} />

            <DatePicker id="ratingDue"
              value={c.ratingDue}
              label="rating due"
              onChange={this.handleDateChange} />
            
            <DatePicker id="end"
              value={c.end}
              label="challenge end"
                onChange={this.handleDateChange} />
          </Accordion>

          <div className="d-flex justify-content-end mt-2 mb-2">
            <SaveButton 
              user={this.props.user}
              loading={this.state.loading}
              uploading={this.state.uploading}
              save={this.save} />

            <SubmitChallengeButtons 
              user={this.props.user} 
              saveDraft={()=>{this.save()}} 
              sendForReview={()=>{this.setState({confirmReview:true})}}/>
          </div>


        </form>
        <Snackbar show={this.state.showSnack} 
          msg={this.state.snackMsg}
          showUndo={this.state.showUndo}
          undo={this.state.snackUndo}
          onClose={this.state.snackOver} />
        
        <Modal id="confirmRemoveVideo" 
          title="Remove video" 
          show={this.state.confirmClearVideo}
          onConfirm={()=>{this.clearField("video");this.autoSave();}}
          closeHandler={()=>{this.setState({confirmClearVideo:false})}}
          >
          Really remove the challenge video? This cannot be undone.
        </Modal>

        <Modal id="thankYou" 
          title="Thank you!" 
          show={this.state.showThankYou}
          onConfirm={()=>{this.setState({goHome:true})}}
          closeHandler={()=>{this.setState({goHome:true})}}
          >
          Your challenge has been submitted.
        </Modal>

        <Modal id="confirmSendForReview" 
          title="Submit for review" 
          show={this.state.confirmReview}
          onConfirm={this.submitForReview}
          closeHandler={()=>{this.setState({confirmReview:false})}}
          >
          Please click <strong>OK</strong> to submit your challenge for review.
          You will hear back shortly from the course instructors after they review your video.
        </Modal>

      </div>);
  }
}

const SaveButton = (props)=> {

  let disabled = "";
  let label = "Save"
  if(props.loading) {
    disabled = "disabled";
    label = "saving..."
  }
  if(props.uploading)
    label = "uploading...";

  return (
    <button type="button" 
      disabled={disabled} 
      className={`btn btn-secondary mr-1 ${disabled}`} 
      style={{minWidth: "120px"}} onClick={props.save}>
      {label}
    </button>
  )
}


const SubmitChallengeButtons = (props)=> {
  if(props.user.admin)
    return null;
  
  return (
    <div className="d-flex justify-content-end mt-2">
      <button type="button" 
        onClick={props.saveDraft} 
        className="btn btn-secondary mr-2">
        Save draft
      </button>
      <button type="button" 
        onClick={props.sendForReview} 
        className="btn btn-secondary">
        Send for review
      </button>
    </div>
  )
}


const FormHeader = (props)=>
{
  const c = props.challenge;
  return (
    <div className="position-relative">
      <div className="ChallengeEditHeader">
        <div className="inner d-flex align-items-center justify-content-between">
          <h4 className="p-2">
            {c.title}
          </h4>
          <div className="d-flex align-items-end mr-2">
            <StatusIndicator dirty={props.dirty} loading={false} />
          </div>

        </div>
      </div>

      <div className="ChallengeMetaData" style={{paddingTop: "40px"}}>
        <div className="small text-muted">Owner: {props.owner.firstName} {props.owner.lastName}</div>
        <small className="text-muted"><tt>created: {df.ts(c.created)} | </tt></small>
        <small className="text-muted"><tt>modified: {df.ts(c.modified)}</tt></small>
      </div>
    </div> );
}

const BasicFields = (props)=>
{
  const c = props.challenge;
  const Fields = (
    <div>
      <TextGroup id="title"
        value={c.title} 
        label="Challenge Title" 
        onChange={props.onChange} 
        required={true} />
      <ChallengeVideo 
        id="video"
        pct={props.pct} 
        msg={props.msg}
        video={c.video}
        clearVideo={props.clearVideo}
        poster={c.videoPoster}
        handleUpload={props.handleUpload} 
      />
      <TextAreaGroup id="prompt"
        value={c.prompt}
        label="Description"
        rows="4"
        onChange={props.onChange} />
    </div>
  );

  if(!props.user.admin)
    return <div>{Fields}</div>;

  return (
    <Accordion id="BasicChallengeFieldsHeader" header="Basics" open={true}>
       {Fields}
    </Accordion>
  )
}

const ChallengeVideo = (props)=> {

  const progress = (<UploadProgress pct={props.pct} msg={props.msg} />);
  const poster = props.poster || "/img/poster.png";

  return (
    <div className="mb-2">
      <VideoUploadImproved id="video" 
       className="m-0 p-0"
       video={props.video}
       poster={poster}
       onChange={props.handleUpload} 
       label=""
       progressBar={progress} />
    </div>

  );
}

const ChooseOwner = (props)=> {
  const c = props.challenge;
  const Owner = (c.owner && c.owner.email)? (
    <div className="mt-2">
      <span className="badge border">
        {c.owner.firstName} {c.owner.lastName} &lt;{c.owner.email}&gt;
        <button type="button" className="btn btn-link mt-1 p-0 ml-2 mr-1" onClick={props.clearOwner}>
          <XIcon className="icon-danger" />
        </button>
      </span>
    </div>
  ): (
    <div>
      <ChooseUser label="Choose owner" selectUser={props.selectUser} placeholder="search the users" />
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
  const Prof = (c.professor && c.professor.email)?
    (
      <div className="mt-2">
        <span className="badge border">
          {c.professor.firstName} {c.professor.lastName} &lt;{c.professor.email}&gt;
          <button type="button" className="btn btn-link mt-1 p-0 ml-2 mr-1" onClick={props.clearProfessor}>
            <XIcon className="icon-danger" />
          </button>
        </span>
      </div>
    ):
    (
      <div>
        <ChooseUser label="Choose professor" selectUser={props.selectUser} placeholder="search for professor" />
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


const Tags =(props)=> {
  return <TextGroup id="tags"
  value={props.tags} 
  label="Tags" 
  placeholder="#People #Tech #Policy #Etc"
  onChange={props.handleChange}
  help="Add tags to make your challenge easier to search and group with similar challenges."
  required={false} />;
}

export {ChallengeEditScreen, Tags};
