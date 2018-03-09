import React from 'react';
import _ from "lodash";

class Snackbar extends React.Component {

  constructor(props) {
    super(props);
    this.state = {active: false};
    this.wait = props.wait || 4000;
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

export default Snackbar;
