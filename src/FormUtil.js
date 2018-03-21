import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import {XIcon, PrimitiveDotIcon, DeviceCameraIcon } from 'react-octicons';
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


const Checkbox = (props)=> {
  if(props.hide)
    return null;
  const extraCss = props.className || "";

  return (
    <div className="form-group">
      <div className="form-check">
        <input type="checkbox"
          value={props.value}
          className={`form-check-input ${extraCss}`}
          id={props.id}
          name={props.id}
          checked={props.checked}
          required={props.required}
          onChange={props.onClick} />
        <label className="form-check-label font-weight-normal" htmlFor={props.id}>{props.label}</label>
        <InvalidMsg msg={props.validationErrorMsg} />
        <ValidMsg msg={props.validationPassedMsg} />
      </div>
    </div>
  )
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
      <InvalidMsg msg={props.validationErrorMsg} />
      <ValidMsg msg={props.validationPassedMsg} />

    </div>
  );
};

const InvalidMsg = (props)=>{
  if(!props.msg || props.msg.length === 0)
    return null;
  return (      
      <div className="invalid-feedback">{props.msg}</div>
  )
}

const ValidMsg = (props)=>{
  if(!props.msg || props.msg.length === 0)
    return null;
  return (      
      <div className="valid-feedback">{props.msg}</div>
  )
}

const TextInput = (props)=> {

  if(props.hide)
    return null;

  const pt = (props.plaintext && props.readOnly)?"-plaintext":"";
  const validationCss = props.validationCss || "";

  return (

    <input type={props.type||'text'}
           value={props.value}
           className={`form-control${pt} ${props.className} ${validationCss}`}
           id={props.id}
           placeholder={props.placeholder}
           onChange={props.onChange}
           readOnly={props.readOnly}
           required={props.required}
           autoFocus={props.autofocus} />
  );
};

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
        <input type="file" required={props.required}
          className="d-none"
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

  const vidFileName = (path)=> {
    let start = path.lastIndexOf("/");
    let end = path.lastIndexOf("?")
    let fileName = (end === -1)?path.slice(start): path.slice(start,end);
    fileName = fileName.replace(/%2F/g,"/");
    return fileName;
  }

  const ClearVideo = ()=> {

    if(!props.clearVideo)
      return <Video {...props} />

    return (
      <div>
        <Video {...props} />
        <div className="d-flex justify-content-end text-light bg-dark m-0 p-0">
          <div><small>{vidFileName(props.video)}</small></div>
          <button type="button" className="btn btn-link p-0 ml-2 mr-1 mt-1"
           onClick={props.clearVideo}>
            <XIcon className="icon-danger" />
          </button>
        </div>
      </div>
    )
  }

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

  const validCss = (!props.required || (props.video && props.video.length > 0))?
    "is-valid" :
    "is-invalid";

  const VideoEl = (props.video)?<ClearVideo /> : uploadBtn;
  return (
      <div className={`p-0 ${validCss}`}>
        {VideoEl}
        {props.progressBar}
        <div className="invalid-feedback">{props.validationErrorMsg} </div>
        <div className="valid-feedback">{props.validationPassedMsg} </div>
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


const ImageUploadImproved = (props)=> {

  if(props.hide)
    return null;

  const UploadBtn = ()=> {
    return (
      <div className="ImageUploadButtonImproved p-0 m-0 position-absolute d-flex justify-content-end"
        style={{top: 0, right: 0}}>
        <input type="file" className="d-none"
          accept="image/*" id={props.id} onChange={props.onChange} />
        <label className="text-primary p-0 m-0" htmlFor={props.id}>
          <div className="btn btn-link p-0 m-0 icon-secondary">
            <DeviceCameraIcon />
          </div>
        </label>
        <button type="button" className="btn btn-link p-0 m-0" onClick={clear}>
           <XIcon className="icon-danger" />
        </button>
      </div>
    )
  }

  const clear = ()=> {
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
    <div className={`ImageUploadImproved position-relative ${props.className}`}>
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
      <InvalidMsg msg={props.validationErrorMsg} />
      <ValidMsg msg={props.validatinPassedMsg} />
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
  DatePicker,
  TextAreaGroup,
  StatusIndicator,
  LoadingSpinner,
  Video,
  VideoUpload,
  ImageUpload,
  VideoUploadImproved,
  ImageUploadImproved,
  Checkbox
};
