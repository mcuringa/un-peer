import React from 'react';
import _ from "lodash";

class Snackbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {active: false};
    this.wait = props.wait || 2500;
    this.hide = _.bind(this.hide, this);
  }

  componentWillReceiveProps(nextProps)
  {
    if(nextProps.show) {
      this.setState({ active: true });
      _.delay(this.hide, this.wait);
    }
  }

  hide() {
    this.setState({ active: false });
    if(this.props.onClose)
      this.props.onClose();
  }


  render() {
    const id = _.uniqueId("snack");
    const showClass = (this.state.active)?"d-block":"d-none";
    return (
      <div className={`Snackbar ${showClass} fixed-bottom rounded-top`} 
        id={id} 
        tabIndex="-1" 
        role="dialog" aria-hidden="true">
        <div className="SnackMsg">{this.props.msg}</div>
        <Undo {...this.props} />

      </div>
    );
  }

}

const Undo = (props)=> {
  if(!props.handleUndo) 
    return null;
  return (<button onClick={props.handleUndo} className=".SnackUndo btn btn-lnk">UNDO</button>);
}

export default Snackbar;
