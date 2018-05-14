import React from 'react';
import _ from "lodash";
import { ChevronLeftIcon } from "react-octicons";
import {Link} from "react-router-dom";

import {Challenge, ChallengeDB} from "./Challenge.js"
import {MediaUpload} from "../MediaManager"
import Response from "./Response"

import Modal from "../Modal";
import LoadingModal from "../LoadingModal";
import {snack, SnackMaker} from "../Snackbar";

class CloseChallengeScreen extends React.Component {
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
    this.handleUpload = this.handleUpload.bind(this);
    this.save = _.bind(this.save, this);
    this.clearField = this.clearField.bind(this);
    this.snack = _.bind(snack, this);
    this.Snackbar = _.bind(SnackMaker, this);
  }


  handleUpload(src, key) {

    let c = this.state.challenge;
    c[key] = src;

    this.setState({challenge: c});    
    this.snack("Upload complete");
    
  }


  clearField(key) { 
    let c = this.state.challenge;
    c[key] = "";
    this.setState({ challenge: c, dirty: true });
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

  save() {
    this.setState({loading: true});
    ChallengeDB.save(this.state.challenge)
    .then(()=>{
      this.setState({loading: false, dirty: false});
      this.snack("saved");
    });
  }

  handleSubmit(e) {
    e.preventDefault();
  }

  handleChange(e) {

    let c = this.state.challenge;
    c[e.target.id] = e.target.value;
    this.setState({ challenge: c, dirty: true });
  }


  render() {
    if(!this.props.user.admin)
      return null;

    if(this.state.loading)
      return <LoadingModal show={true} />

    const c = this.state.challenge;
    // console.log(c);
    return (
      <div className="ChallengeEdit screen">
        <h4>
          <button className="btn btn-link mr-2" onClick={this.props.history.goBack}><ChevronLeftIcon /></button>
          {c.title}
        </h4>

        <form className="mt-2" onSubmit={(e)=>{e.preventDefault();}}>
          <label>Professor Video</label>
          
          <MediaUpload id="professorVideo" 
            media="video"
            path={c.id}
            url={c.professorVideo}
            poster={c.professorVideoPoster}
            handleUpload={this.handleUpload}
            pct={this.state.professorVideoPct} 
            msg={this.state.professorVideoStatus}
            clearMedia={this.clearField}
          />

          <label className="mt-2 pb-0 mb-0">Video thumbnail</label>
          <MediaUpload id="professorVideoPoster" 
            media="img"
            path={c.id}
            textOnly
            url={c.profVideoPoster}
            handleUpload={this.handleUpload}
            placeholder="upload a professor video thumbnail image"
            pct={this.state.profVideoPosterPct} 
            msg={this.state.profVideoPosterStatus}
            clearMedia={this.clearField}
          />

          <div className="d-flex justify-content-between align-items-baseline">
            <label className="mt-2 pb-0 mb-0">
              Featured responses
            </label>
            <small className="pl-1">[<Link to={`/challenge/${c.id}/review`}>change featured responses</Link>]</small>
          </div>

          <Response 
            response={c.ownerChoice} 
            ownerChoice={true}
            user={this.props.user}
            open={false} 
            editable={false} />

          <Response 
            response={c.professorChoice}
            profChoice={true}
            user={this.props.user}
            open={false} 
            editable={false} />


          <div className="d-flex justify-content-end mt-2 mb-2">
            <SaveButton 
              user={this.props.user}
              loading={this.state.loading}
              uploading={this.state.uploading}
              save={this.save} />
          </div>


        </form>
        <this.Snackbar />

        
        <Modal id="confirmRemoveVideo" 
          title="Remove video" 
          show={this.state.confirmClearVideo}
          onConfirm={()=>{this.clearField("professorVideo");}}
          closeHandler={()=>{this.setState({confirmClearVideo:false})}}
          >
          Really remove the challenge video? This cannot be undone.
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





export {CloseChallengeScreen};
