import React from 'react';
import {GearIcon, TriangleDownIcon, ThreeBarsIcon} from "react-octicons";
import _ from "lodash";
import { Manager, Reference, Popper } from 'react-popper';

class MoreMenu extends React.Component {
  constructor(props) {
    super(props);
    this.id = _.uniqueId("MoreMenu_");
    console.log("constructor more id", this.id);
    this.state = {open: false};
    this.popper = {};
    
  }



  // componentDidMount() {

  //   const container = document.getElementById("main");
  //   const menu = document.querySelector(`#${this.id} .MoreMenuPopper`);
  //   const trigger = document.querySelector(`#${this.id} .MoreIcon`);
  //   let rect = trigger.getBoundingClientRect();
  //   console.log("trigger rect", rect);

  //   const closeListener = (e)=> {
  //     if(menu.contains(e.target) || trigger.contains(e.target))
  //       return;
  //     // console.log("closeListener", e);
  //     if(this.state.open)
  //       this.setState({open: false}); 
  //   }
  //   document.addEventListener('click', closeListener);
  //   // console.log("trigger", trigger);
  //   // console.log("menu", menu);

  //   // this.popper = new Popper(trigger, menu, {
  //   //   placement: 'left-start',
  //   //   flip: {
  //   //       behavior: ['left', 'bottom', 'top']
  //   //   },
  //   //   // preventOverflow: {
  //   //   //   boundariesElement: container,
  //   //   // },
  //   // });

  // }


  render() {

    const MenuIcon = ()=> {
      if(!this.props.menuIcon)
        return <KebabVerticalIcon />;
      if(this.props.menuIcon === "gear")
        return <GearIcon />
      if(this.props.menuIcon === "arrow")
        return <TriangleDownIcon />
      if(this.props.menuIcon === "bars")
        return <ThreeBarsIcon />

      return this.props.menuIcon;
    }

    const MenuLabel = ()=> {
      if(!this.props.label)
        return null;
      return (<span className="mr-1">{this.props.label}</span>)
    }

    const css = this.props.className || "";
    const viz = (this.state.open)?"d-block":"d-none";
    const toggle = ()=> {
      this.setState({open: !this.state.open}); 
      this.popper.update();
    }





    return (
      <div id={this.id} className={`${css}`}>
        <button
          type="button" 
          onClick={toggle}
          className="MoreIcon btn btn-link">
          <MenuLabel /><MenuIcon />
        </button>
        <div className={`MoreMenuPopper ${viz}`}>
          {this.props.children}
        </div>
      </div>
    )
  }
}


const KebabVerticalIcon = ()=> {

  const len = 32;
  return (
    <svg width={len} height={len} className="octicon octicon-kebab-vertical" viewBox={`0 0 ${len} ${len}`}>
      <circle fill="#efefef" cx={len/2} cy={len/2} r={(len/2)} />
      <circle fill="gray" cx={len/2} cy={len * .33} r={1.5} />
      <circle fill="gray" cx={len/2} cy={len/2} r={1.5}  />
      <circle fill="gray" cx={len/2} cy={len * .66} r={1.5} />
    </svg>
  )
}

export default MoreMenu;
export {KebabVerticalIcon}