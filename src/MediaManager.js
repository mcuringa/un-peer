import React from 'react';
import _ from "lodash";
    
const firebase = require("firebase");
require("firebase/storage");




class UploadProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      msg: "",
      pct: 0
    };
    this.handlError = this.handlError.bind(this);
    this.handleSuccess = this.handleSuccess.bind(this);
    this.handleStateChange = this.handleStateChange.bind(this);

  }


  handlError(e) {
    this.setState({
      msg: `Upload failed: ${e}`,
      pct: 0
    });
  }


  handleSuccess() {
    this.setState({
      msg: `Upload complete!`
    });
  }


  handleStateChange(snapshot) {
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
    this.setState({
      msg: `Upload is ${progress}% done`,
      pct: progress
    });
    switch (snapshot.state) {
      case firebase.storage.TaskState.PAUSED: // or 'paused'
        console.log('Upload is paused');
        break;
      case firebase.storage.TaskState.RUNNING: // or 'running'
        console.log('Upload is running');
        break;
    }
  }


  render() {
    if(!this.props.uploadTask)
      return null;

    // console.l

    this.props.uploadTask.on(firebase.storage.TaskEvent.STATE_CHANGED, this.handleStateChange, this.handleError, this.handleSuccess);
    
    return (
      <div className="UploadProgress">
        <div className="ProgressBar" style={{width: this.state.pct}}></div>
        <div className="ProgressMsg">{this.state.msg}</div>
      </div>
    );
  }

}


export {UploadProgress};