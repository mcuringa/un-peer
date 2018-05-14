import React from 'react';
import _ from "lodash";
import {
  TrashcanIcon,
  DeviceCameraIcon,
  DeviceCameraVideoIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from 'react-octicons';
import FBUtil from "./FBUtil";
import {
  Label,
  ValidMsg,
  InvalidMsg
} from "./FormUtil";

const storageFileName = (path)=> {
  let start = path.lastIndexOf("/");
  let end = path.lastIndexOf("?")
  let fileName = (end === -1)?path.slice(start): path.slice(start,end);
  fileName = fileName.replace(/%2F/g,"/");
  return fileName;
}

const fileName = (path)=> {
  return  _.last(storageFileName(path).split("/"));
}


const formatFileSize = (bytes, si)=>{
  const thresh = si ? 1000 : 1024;
  if(bytes < thresh) return bytes + ' B';
  const units = si ? ['kB','MB','GB','TB','PB','EB','ZB','YB'] : ['KiB','MiB','GiB','TiB','PiB','EiB','ZiB','YiB'];
  let u = -1;
  do {
      bytes /= thresh;
      ++u;
  } while(bytes >= thresh);
  return bytes.toFixed(1)+' '+units[u];
}

const UploadProgress = (props)=> {

  let pct = props.pct;
  if((!pct || _.isNaN(pct)) && !props.show)
    return null;

  pct = props.pct || 0;

  return (
    <div className="progress w-100">
      <div className="progress-bar bg-warning progress-bar-striped progress-bar-animated text-dark" 
           role="progressbar" style={{width: `${pct}%`, minWidth: "2em"}} 
           aria-valuenow={pct} aria-valuemin="0" aria-valuemax="100">{_.round(pct)}%</div>
    </div>
  );
}


class MediaUpload extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      pct: 0, 
      msg: 0,
      uploading: false
    };
    this.handleUpload = _.bind(this.handleUpload, this);
    this.reportValidity = _.bind(this.reportValidity, this);
    this.getErrorMsg = _.bind(this.getErrorMsg, this);
    this.getFileSizeErrorMsg = _.bind(this.getFileSizeErrorMsg, this);

    this.reportValidity = _.throttle(this.reportValidity, 1000);
  }

  reportValidity() {
    // console.log("checking media validity");
    // console.log("required: ");
    // console.log(this.props.required);
    const url = this.props.url || "";
    const empty = (this.props.required && url.trim().length === 0)
    if(empty)
      return false;
    if(this.state.fileSizeExceeded || this.state.uploading)
      return false;

    return true;

  }

  getFileSizeErrorMsg() {
    return this.props.filesizeErrorMsg || "Your file is too large. Max file size is " + formatFileSize(this.props.maxFileSize, true);
  }

  getErrorMsg() {

    const noUrl = (!this.props.url || this.props.url.trim().length === 0);

    if(this.state.uploading)
      return "Please wait for your upload to complete before saving.";
    if(this.state.fileSizeExceeded)
      return this.getFileSizeErrorMsg();
    if(noUrl)
      return this.props.requiredErrorMsg || "Please upload a file before submitting.";
    
    return null;
  }

  componentDidUpdate() {
    const id = `${this.props.id}`;
    let field = document.getElementById(id);
    if(field && !this.reportValidity())
      field.setCustomValidity(this.getErrorMsg());
  }

  handleUpload(e) {

    let file = e.target.files[0];
    const size = file.size;
    if(this.props.maxFileSize && this.props.maxFileSize < size) {
      this.setState({fileSizeExceeded: true});
      return;
    }
    const key = e.target.id;

    this.setState({
        pct: 1,
        msg: "uploading...", 
        fileSizeExceeded: false,
        uploading: true});

    
    const succ = (task)=> {
      this.setState({
        pct: 0,
        msg: "",
        uploading: false
      });

      this.props.handleUpload(task.snapshot.downloadURL, key);
    }

    const watch = (snapshot)=> {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      const xfer = formatFileSize(snapshot.bytesTransferred, true);
      const total = formatFileSize(snapshot.totalBytes, true);

      this.setState( {
        pct: progress, 
        msg: `${xfer} of ${total}`
      });
    }

    const err = (e)=>{
      console.log(e);
    }

    FBUtil.uploadMedia(file, this.props.path, watch, succ, err);
  }

  render() {

    if(this.props.hide)
      return null;
    
    const validCss = (this.reportValidity())?"is-valid":"was-validated is-invalid";

    const params = _.omit(this.props, ["handleUpload"]);
    const Uploader = () =>{
      if(this.props.media === "img") {
        if(this.props.imgOnly) {
          return (
          <ImageOnlyUpload {...params} 
            handleUpload={this.handleUpload} 
            pct={this.state.pct}
            msg={this.state.msg}
            uploading={this.state.uploading}  />
          )
        }
        return (
          <ImageUpload {...params} 
            handleUpload={this.handleUpload} 
            pct={this.state.pct}
            msg={this.state.msg}
            uploading={this.state.uploading}  />
        )
      }

      return (
        <VideoUpload {...params} 
          handleUpload={this.handleUpload} 
          pct={this.state.pct}
          msg={this.state.msg}
          uploading={this.state.uploading}  />
      )
    }

    return (

      <div className={`MediaUploader ${this.props.className||""} ${validCss}`}>
        <Uploader />
        <FileSizeError error={this.state.fileSizeExceeded} msg={this.getFileSizeErrorMsg()} />
        <InvalidMsg msg={this.getErrorMsg()} />
        <ValidMsg msg={this.props.validationPassedMsg} />
      </div>

    )
  }
}

const FileSizeError = (props)=>{
  if(props.error)
    return <div className="error-msg">{props.msg}</div>
  return null;
}

const UploadFileInput = (props)=>{
  return (
    <input id={props.id} type="file" className="d-none"
      accept={props.accept}  onChange={props.handleUpload} />
  )
}

const VideoUpload = (props) => {
  
  return (
    <div className="VideoUpload">
  
      <Video src={props.url} />
      <VideoLabel {...props} />
      <UploadProgress pct={props.pct} msg={props.msg}  show={props.uploading} />
    </div>
  )
}

const VideoLabel = (props)=> {
  const clear = ()=> {
    props.clearMedia(props.id);
  }

  if(props.url) {
    return (
      <div className="d-flex justify-content-between">
        {fileName(props.url)}
        <div className="d-flex justify-content-end">
          <UploadFileInput id={props.id} handleUpload={props.handleUpload} accept="video/*" />
          <label className="text-primary p-0 m-0" htmlFor={props.id}>
            <div className="btn btn-link p-0 m-0 icon-secondary">
              <DeviceCameraVideoIcon />
            </div>
          </label>
          <button type="button" className="btn btn-link p-0 m-0" onClick={clear}>
             <TrashcanIcon className="icon-secondary ml-2" />
          </button>
        </div>
      </div>
    )
  }
  return (
     <div className="VideoUploader">
      <UploadFileInput id={props.id} handleUpload={props.handleUpload} accept="video/*" />
      <label className="VideoUploadButton d-block p-3 m-0" htmlFor={props.id}>
        Click to <br />
        Upload Video
      </label>
    </div>
  )


}

const Video = (props)=> {
 
  if(!props.src)
    return null;

  return (
    <div className="embed-responsive embed-responsive-16by9">
      <video controls="true" poster={props.poster} src={props.src} />
    </div>
  );
}


const ImageUpload = (props)=> {
  const clear = ()=> {
    props.clearMedia(props.id);
  }

  return (
    <div>
      <Label label={props.label} htmlFor="" />
      <div className="ImageUploadLabel d-flex justify-content-between">
        <FileNameLink {...props} />
        <div className="ImageUploadButtonImproved p-0 m-0 d-flex justify-content-end">
          <UploadFileInput id={props.id} handleUpload={props.handleUpload} accept="image/*"/>
          <label className="text-primary p-0 m-0" htmlFor={props.id}>
            <div className="btn btn-link p-0 m-0 icon-secondary">
              <DeviceCameraIcon />
            </div>
          </label>
          <button type="button" className="btn btn-link p-0 m-0" onClick={clear}>
             <TrashcanIcon className="icon-secondary ml-2" />
          </button>
        </div>
      </div>
      <div className="collapse bg-dark p-2" id={`ImgUpload_${props.id}`}>
        <img src={props.url || props.placeholderImg} alt="upload preview" />
      </div>
      <UploadProgress pct={props.pct} msg={props.msg}  show={props.uploading} />
    </div>
  )
}

const ImageOnlyUpload = (props)=> {
  return (
    <div className="ImageUploadImproved">
      <div className="position-relative" id={`ImgUpload_${props.id}`}>
        <UploadBtn {...props} />
        <img src={props.url || props.placeholderImg} alt="upload preview" />
      </div>
      <UploadProgress pct={props.pct} msg={props.msg}  show={props.uploading} />
    </div>
  )
}

const UploadBtn = (props)=> {

  const clear = ()=> {
    props.clearMedia(props.id);
  }

  return (
    <div className="ImageUploadButtonImproved p-0 m-0 position-absolute d-flex justify-content-between align-items-baseline"
      style={{bottom: 0, left: 0, right: 0}}>
      <UploadFileInput id={props.id} handleUpload={props.handleUpload} accept="image/*" />
      <label className="p-0 m-0" htmlFor={props.id}>
        <div className="btn btn-link p-0 ml-1 icon-secondary">
          <DeviceCameraIcon className="" />
        </div>
      </label>
      <button type="button" className="btn btn-link p-0 m-0" onClick={clear}>
         <TrashcanIcon className="mr-1" />
      </button>
    </div>
  )
}


const FileNameLink = (props)=> {
  if(!props.url)
    return (
      <span className="text-mute">{props.placeholder}</span>
    )
  return (
    <button type="button" className="collapsed btn btn-link text-secondary p-0 d-flex align-items-baseline" 
      data-toggle="collapse" 
      data-target={`#ImgUpload_${props.id}`} 
      aria-controls={`ImgUpload_${props.id}`} aria-expanded="false" aria-label="toggle image">
      <div className="toggle-icons icon-secondary d-flex align-items-baseline">
        <ChevronUpIcon />
        <ChevronDownIcon />
      </div>
      {fileName(props.url)}
    </button>
  )
}



export {UploadProgress, formatFileSize, MediaUpload};