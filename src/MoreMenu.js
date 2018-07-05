import React from 'react';
import {GearIcon, TriangleDownIcon, ThreeBarsIcon} from "react-octicons";
import _ from "lodash";

class MoreMenu extends React.Component {
  constructor(props) {
    super(props);
    this.id = _.uniqueId("MoreMenu_");
    this.state = {open: false};
    this.positionMenu = _.bind(this.positionMenu, this);
    
  }

  positionMenu(e) {

    const header = document.querySelector(".App-header");
    const topOffset = header.getBoundingClientRect().height;

    const footer = document.querySelector(".App-footer");
    const bottom = footer.getBoundingClientRect().y;

    const container = document.getElementById("main");
    const containerRect = container.getBoundingClientRect();

    const menu = document.querySelector(`#${this.id} .MoreMenuPopper`);
    const menuRect = menu.getBoundingClientRect();
    
    const trigger = document.querySelector(`#${this.id} .MoreIcon`);
    const triggerRect = trigger.getBoundingClientRect();

    let menuTop = triggerRect.y - containerRect.y + topOffset;
    let menuBottom = triggerRect.y + menuRect.height;
    if(menuBottom > bottom) {
      menuTop = bottom - menuRect.height - containerRect.y + topOffset - 4;
    }
    menu.style.left = (triggerRect.right - menuRect.width - 20) + "px";
    menu.style.top = menuTop + "px";

  }

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

    const close = ()=> { this.setState({open: false});};
    const Cover = ()=> {
      if(!this.state.open)
        return null;
      return <div onClick={close} className="MoreMenuCover" />
    }

    const css = this.props.className || "";
    // const viz = (this.state.open)?"d-block":"d-none";
    const viz = (this.state.open)?"visible":"invisible";
    const toggle = (e)=> {
      this.setState({open: !this.state.open}); 
      this.positionMenu(e);
    }

    return (
      <div>
        <Cover />
        <div id={this.id} className={`MoreMenu ${css}`}>
          <button
            type="button" 
            onClick={toggle}
            className="MoreIcon btn btn-link">
            <MenuLabel /><MenuIcon />
          </button>
          <div className={`MoreMenuPopper bg-light border shadow-sm position-absolute ${viz}`}>
            {this.props.children}
          </div>
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