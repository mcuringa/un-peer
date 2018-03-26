import React from 'react';
import {ChevronDownIcon, ChevronUpIcon} from 'react-octicons';

class Accordion extends React.Component {
  constructor(props) {
    super(props);
    this.state = {open: props.open}
  }

  render() {

    if(this.props.hide)
      return null;

    const ToggleIcon = (this.state.open)?(<ChevronDownIcon />):(<ChevronUpIcon />);
    const toggleCss = (this.state.open)?"show":"";
    const toggleFunction = ()=> {
      this.setState({open: !this.state.open})
    }
    const css = this.props.className || "";
    return (
      <div className={`Accordion card ${css}`}>
        <AccordionHeader 
          id={`${this.props.id}Header`} 
          toggleFunction={toggleFunction}
          ToggleIcon={ToggleIcon}
          data-target={`#${this.props.id}`}
          aria-expanded={this.state.open}
          aria-controls={this.props.id}>
          
          {this.props.header}

        </AccordionHeader>
        <AccordionBody id={this.props.id} toggleCss={toggleCss}>
          {this.props.children}
        </AccordionBody>
      </div>
    )
  }
}

const AccordionBody = (props)=> {
  return (  
    <div id={props.id} 
      className={`AccordionBody card-body collapse pl-2 ${props.toggleCss}`}  
      data-parent={`${props.id}Header`}>
      {props.children}
    </div>
  )
}

const AccordionHeader = (props)=> {

  return (
    <div id={`${props.id}Header`} 
      className="AccordionHeader clickable d-flex justify-content-between icon-secondary p-2 bg-light" 
      data-toggle="collapse" 
      onClick={props.toggleFunction}
      data-target={`#${props.id}`}
      aria-expanded={props.open}
      aria-controls={props.id}>

      {props.children}
      {props.ToggleIcon}

    </div>
  )
}

export default Accordion;
