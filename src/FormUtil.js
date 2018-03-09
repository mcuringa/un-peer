import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import {XIcon, PrimitiveDotIcon } from 'react-octicons';
import {UploadProgress} from "./MediaManager";  

const LoadingSpinner = (props)=> {
  return (
    <span className="LoadingSpinner">
        <img className={`${(props.loading)?"":"d-none"}`}
             alt="Loading"
             style={{maxHeight: "16px"}}
             src="/img/puff.svg" />
    </span>
    );
}

const StatusIndicator = (props)=> {
  let clazz = (props.dirty)?"icon-warning":"icon-success";
  if(props.loading)
    clazz += " hidden";

  return (
    <div className="">
      <PrimitiveDotIcon className={clazz} />
      <LoadingSpinner loading={props.loading} />
    </div>
  );
}

const TextGroup = (props)=> {

  if(props.hide)
    return null;

  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <TextInput type={props.type||'text'}
             value={props.value}
             className="form-control"
             id={props.id}
             placeholder={props.placeholder}
             onChange={props.onChange}
             readOnly={props.readOnly}
             plaintext={props.plaintext}
             required={props.required}
             autofocus={props.autoFocus} />
      <small id={`${props.id}Help`} className="form-text text-muted">{props.help}</small>
      <ErrorMessage msg={props.validationErrorMsg} show={props.showError} />

    </div>
  );
};

const ErrorMessage = (props)=>{
  if(!props.show || !props.msg || props.msg.length === 0)
    return null;
  console.log("error");
  return (      
    <div className="text-danger"><small>{props.msg}</small></div>
  );
}

const TextInput = (props)=> {

  if(props.hide)
    return null;

  const pt = (props.plaintext && props.readOnly)?"-plaintext":"";

  return (

    <input type={props.type||'text'}
           value={props.value}
           className={`form-control${pt} ${props.className}`}
           id={props.id}
           placeholder={props.placeholder}
           onChange={props.onChange}
           readOnly={props.readOnly}
           required={props.required}
           autoFocus={props.autofocus} />
  );
};

class NewTextInput extends React.Component {
  render() {
    const pt = (this.props.plaintext && this.props.readOnly) ?
          "-plaintext" : "";

    // So, sorry for the awkward jsx formatting here - this is just
    // how rjsx-mode in emacs formats it for me.
    return (
      <input type={this.props.type||'text'}
             value={this.props.value}
             className={`form-control${pt} ${this.props.className}`}
             id={this.props.id}
             placeholder={this.props.placeholder}
             onChange={this.props.onChange}
             readOnly={this.props.readOnly}
             required={this.props.required}
             autoFocus={this.props.autofocus} />
    );
  }
}



const Video = (props)=> {

  const extracss = (props.video)?"":"d-none";
  const dclass = (props.className)?props.className:"";
  const poster = props.poster;

  return (
    <div className={`${extracss} ${dclass} embed-responsive embed-responsive-16by9`}>
      <video controls="true" poster={poster} src={props.video} />
    </div>
  );

}

const VideoUpload = (props)=> {


  return (
    <div className="mb-2">
      <Video {...props} />
      <div className="custom-file">
        <input type="file" className="d-none"
        accept="video/*" id={props.id} onChange={props.onChange} />
        <label className="btn btn-link text-dark pb-2" htmlFor={props.id}>
            <div className="btn btn-secondary">{props.label}</div>
            <img className="ml-1" src="/img/video-response_btn.png"
                 alt="Video response button"/>
        </label>
      </div>
    </div>
  );
};

const VideoUploadImproved = (props)=> {
  if(props.hide)
    return null;

  const uploadBtn = (
    <div className="VideoUploadButton d-block">
      <input type="file" className="d-none"
        accept="video/*" id={props.id} onChange={props.onChange} />
        <label className="" htmlFor={props.id}>
            <img className="" src="/img/video-upload.png"
                 alt="Video upload button"/>
        </label>
    </div>
  );

  const VideoEl = (props.video)?<Video {...props} /> : uploadBtn;

  return (
    <div className="p-0">
      {VideoEl}
      {props.progressBar}
    </div>
  );
};

const ImageUpload = (props)=> {

  if(props.hide)
    return null;

  const UploadBtn = ()=> {
    const btnLabel = (props.img && props.img.length)?"replace image":"choose image"
    return (
      <div className="ImageUploadButton">
        <input type="file" className="d-none"
          accept="image/*" id={props.id} onChange={props.onChange} />
          <label className="text-primary d-block" htmlFor={props.id}>
            <div className="btn btn-secondary btn-block">
              {btnLabel}
            </div>
          </label>
      </div>
    )
  }

  const clear = ()=>{
    props.clearImage(props.id);
  }

  const ImageThumbnail = ()=> {
    
    if(!props.img)
      return null;

    return (
      <img src={props.img} alt="thumbnail" />
    );
  }
  
  return (
    <div className="form-group">
      <label htmlFor={props.id}>
        {props.label}
        <button type="button" className="btn btn-link mt-1 ml-1 pl-0" onClick={clear}>
          <XIcon className="icon-danger" />
        </button>
      </label>
      <small id={`${props.id}Help`} className="form-text text-muted">{props.help}</small>
      <UploadBtn />
      <ImageThumbnail />
      <UploadProgress pct={props.pct} msg={props.msg} hide={false} />

    </div>
  );
};


const DatePicker = (props)=> {

  if(props.hide)
    return null;

  // 📅 -- emoji?
  const dFmt = (d)=> dateFormat(d, "ddd mmm dd");
  const cFmt = (d)=> dateFormat(d, "yyyy-mm-dd");

  return (
    <div className="DatePicker form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <div className="input-group mb-3">
        <div className="input-group-prepend">
          <span className="input-group-text">{dFmt(props.value)}</span>
        </div>
        <TextInput
          id={props.id}
          type="date"
          value={cFmt(props.value)}
          placeholder={props.placeholder}
          onChange={props.onChange}
          readOnly={props.readonly}
          required={props.required}
          plaintext={props.plaintext} />
      </div>
    </div>

  );
};

const TextAreaGroup = (props)=> {

  if(props.hide)
    return null;

  return (
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <textarea id={props.id}
        className="form-control"
        onChange={props.onChange}
        rows={props.rows || 4}
        placeholder={props.placeholder}
        value={props.value}
        readOnly={props.readonly}
        required={props.required} />
      <small id={`${props.id}Help`} className="form-text text-muted">{props.help}</small>
    </div>
  );
};

const RadioButtonGroup = (props)=>
{
  let radios = _.map(props.options, (v,k)=>{
    return (
      <RadioButton
        key={`${props.id}.${k}`}
        id={`${props.id}.${k}`}
        name={props.id}
        checked={props.value === k}
        value={k}
        label={v}
        onChange={props.onChange}
      />
      );
  });

  return(
    <div className="form-group">
      <label htmlFor={props.id}>{props.label}</label>
      <small id={`${props.id}Help`} className="form-text text-muted">{props.help}</small>
        {radios}
    </div>
    );
}

const RadioButton = (props)=>
{
  return(
    <div className="input-group">
      <div className="input-group-prepend">
        <div className="input-group-text">
          <input id={props.id}
            className="form-control radio"
            type="radio"
            checked={props.checked}
            name={props.name}
            value={props.value}
            autoComplete="off"
            onChange={props.onChange}
            onClick={()=>{console.log("clicked");}} />
          </div>
      </div>
        <TextInput
          value={props.label}
          readOnly={true}
          plaintext={true} />
    </div>


    );
}


export {
  RadioButtonGroup,
  TextGroup,
  TextInput,
  NewTextInput,
  DatePicker,
  TextAreaGroup,
  StatusIndicator,
  LoadingSpinner,
  Video,
  VideoUpload,
  ImageUpload,
  VideoUploadImproved
};
