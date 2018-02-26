import React from 'react';
import _ from "lodash";





class UploadProgress extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      challenge: Challenge, 
      owner: {displayName: props.user.displayName, email: props.user.email, id: props.user.uid},
      loading: true
    };
    this.handleStateChange = this.handleStateChange.bind(this);

  }

  componentWillMount() {

  }

  handleStateChange(snapshot){
    // Observe state change events such as progress, pause, and resume
    // Get task progress, including the number of bytes uploaded and the total number of bytes to be uploaded
    var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
    console.log('Upload is ' + progress + '% done');
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
    return (
      <div className="UploadProgress">
        <div className="ProgressBar"></div>
        <div className="ProgressMsg"></div>
      </div>
    );
  }

}





const Video = (props)=> {

  const dclass = (props.video)?"":"d-none";

  return (  
    <div className={`${props.className} ${dclass} embed-responsive embed-responsive-16by9 mb-2`}>
      <video controls="true" poster={props.poster} src={props.video} />
    </div>
  );

}

const VideoUpload = (props)=> {


  return (
    <div>
      <Video video={props.video} />
      <div className="custom-file">
        <input type="file" className="d-none" 
        accept="video/*" id={props.id} onChange={props.onChange} />
        <label className="" htmlFor={props.id}>{props.label}
        <img src="/img/video-response_btn.png" /> </label>
      </div>
    </div>
  );
};
