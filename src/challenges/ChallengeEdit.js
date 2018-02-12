import React from 'react';
import _ from "lodash";
import dateFormat from 'dateformat';
import { Link } from 'react-router-dom'
import {User, Challenge, ChallengeDB} from "./Challenge.js"
import { CalendarIcon, PrimitiveDotIcon } from 'react-octicons';
// import DateRangePicker from 'react-bootstrap-daterangepicker';
// import 'bootstrap-daterangepicker/daterangepicker.css';
import FBUtil from "../FBUtil";




class ChallengeEditScreen extends React.Component {
  constructor(props) {
    super(props);
    const id = this.props.match.params.id || "";
    this.state = {
      challenge: Challenge, 
      owner: User,
      loading: true,
      dirty: false
    };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleChange.bind(this);
    this.handleDateChange = this.handleDateChange.bind(this);
    this.save = this.save.bind(this);
    this.save = _.debounce(this.save, 5000);
  }

  componentWillMount() {
    const id = this.props.match.params.id;
    ChallengeDB.get(id,(c)=>{
      this.setState({"owner": c.owner});
      this.setState({challenge: c});
      this.setState({loading: false});
    });
  }

  save() {
    this.setState({loading: true});
    ChallengeDB.save(this.state.challenge)
    .then(()=>{this.setState({loading: false, dirty: false});});
  }

  handleSubmit(e) {
    this.save();
    e.preventDefault();
  }

  handleChange(e) {
    let c = this.state.challenge;
    c[e.target.id] = e.target.value;
    this.setState({ challenge: c, dirty: true });
    this.save();
  }

  handleDateChange(e) {
    let c = this.state.challenge;
    const date = ChallengeDB.parseDateControlToUTC(e.target.value);
    console.log("date changed");
    console.log(date);
    c[e.target.id] = date;

    this.setState({ challenge: c, dirty: true });

    this.save();
  }



  render() {
    const c = this.state.challenge;
    return (
      <div>
        <h3 className="">Challenge Edit Form
          <StatusIndicator dirty={this.state.dirty} loading={this.state.loading} /></h3>
        <form>
          <TextGroup id="title"
            value={c.title} 
            label="Challenge Title" 
            onChange={this.handleChange} 
            required={true} />
          
          <TextAreaGroup id="prompt"
            value={c.prompt}
            label="Description"
            rows="8"
            onChange={this.handleChange} />
          
          <fieldset>
            <legend>Schedule</legend>
            <DatePicker id="start"
              value={c.start}
              label="challenge start"
              onChange={this.handleDateChange} />
           
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

          </fieldset>
        
        </form>
      </div>);
  }
}

const LoadingSpinner = (props)=> {
  return (
    <img className={(props.loading)?"":"d-none"} style={{height: "32px"}} src="/img/spinner.gif" />
    );
}

const StatusIndicator = (props)=> {
  let clazz = (props.dirty)?"icon-warning":"icon-success";
  if(props.loading)
    clazz += " hidden";

  return (
    <div className="float-right">
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
           readOnly={props.readonly} 
           required={props.required}/>
    <small id={`${props.id}Help`} className="form-text text-muted">{props.help}</small>
  </div>
  );
};

const TextInput = (props)=> {

  return (

    <input type={props.type||'text'} 
           value={props.value} 
           className="form-control" 
           id={props.id} 
           placeholder={props.placeholder}
           onChange={props.onChange} 
           readOnly={props.readonly} 
           required={props.required}/>
  );
};

const DatePicker = (props)=> {
  // 📅 -- emoji?
  const dFmt = (d)=> {
    
    // if(!d.getTime) { //duck-type checking
    //   let x = new Date(d);
    //   x.setMinutes(x.getMinutes() + new Date().getTimezoneOffset());
    //   return dateFormat(x, "ddd mmm dd");
    // } 
      
    return dateFormat(d, "ddd mmm dd");
  }
  const cFmt = (d)=> {
    // if(!d.getTime)

    return dateFormat(d, "yyyy-mm-dd");
  }

  // console.log(props.label + "::" + props.value + "::" + new Date(props.value)) ;

  return (
    <div className="input-group mb-3">
     <label>{props.label}</label>
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
        required={props.required}/>
    </div>

  );
};

const TextAreaGroup = (props)=> {

  return (
  <div className="form-group">
    <label htmlFor={props.id}>{props.label}</label>
    <textarea id="{props.id}"
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

export default ChallengeEditScreen;