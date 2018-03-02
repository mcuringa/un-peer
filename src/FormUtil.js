import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import { CalendarIcon, PrimitiveDotIcon } from 'react-octicons';

const LoadingSpinner = (props)=> {
  return (
    <span className="LoadingSpinner">
      <img className={`${(props.loading)?"":"d-none"}`} src="/img/puff.svg" />
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
  </div>
  );
};

const TextInput = (props)=> {

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

  const dclass = (props.video)?"":"d-none";
  const poster = props.poster;

  return (
    <div className={`${props.className} ${dclass} embed-responsive embed-responsive-16by9 mb-2`}>
      <video controls="true" poster={poster} src={props.video} />
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
        <label className="btn btn-link text-dark" htmlFor={props.id}>
            {props.label}
            <img className="ml-1" src="/img/video-response_btn.png" />
        </label>
      </div>
    </div>
  );
};


const DatePicker = (props)=> {
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
        checked={props.value == k}
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
  VideoUpload
};
