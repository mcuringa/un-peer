import React from 'react';
import _ from "lodash";

class Snackbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {active: false};
    this.wait = props.wait || 2000;
    this.hide = _.bind(this.hide, this);
  }

  componentWillReceiveProps(nextProps)
  {
    if(nextProps.show) {
      const waitTime = (this.props.showUndo) ? this.wait + 500 : this.wait;
      this.setState({ active: true });
      _.delay(this.hide, waitTime);
    }
  }

  hide() {
    this.setState({ active: false });
    if(this.props.onClose && !this.undone)
      this.props.onClose();
  }


  render() {
    const id = _.uniqueId("snack");
    const showClass = (this.state.active)?"d-flex":"d-none";
    
    let undo = ()=> {
      this.undone = true;
      this.setState({active: false});
      this.props.undo();
    }

    return (
      <div className={`Snackbar ${showClass} fixed-bottom rounded-top justify-content-around`} 
        id={id} 
        tabIndex="-1" 
        role="dialog" aria-hidden="true">
        <div className="SnackMsg">{this.props.msg}</div>
        <Undo undo={undo} show={this.props.showUndo} />

      </div>
    );
  }

}

const Undo = (props)=> {
  if(!props.show) 
    return null;
  return (<button onClick={props.undo} type="button"
    className=".SnackUndo btn btn-link text-danger">UNDO</button>);
}

function snack(msg, showUndo) {


  showUndo = showUndo || false;

  const p = (resolve, reject)=>
  {
    const clear = ()=> {
      console.log("clear called");

      let snackConfig = {
        show: false,
        msg: "",
        showUndo: false,
        undo: null,
        onClose: null
      }

      this.setState({snackConfig: snackConfig});
    }
    const over = ()=> {
      clear();
      resolve();
    }

    const undo = ()=> {
      clear();
      reject();
    }

    let snackConfig = {
      show: true,
      msg: msg,
      showUndo: showUndo,
      undo: undo,
      onClose: over
    }
  this.setState({snackConfig: snackConfig});

  }

  return new Promise(p);
}

function SnackMaker() {
  return(
    <Snackbar {...this.state.snackConfig} wait={this.timeout} />
  )
}


export default Snackbar;
export {SnackMaker, snack};