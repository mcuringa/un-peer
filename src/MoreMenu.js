import React from 'react';
import {GearIcon, TriangleDownIcon, ThreeBarsIcon} from "react-octicons";

const MoreMenu = (props)=> {
  const MenuIcon = ()=> {
    if(!props.menuIcon)
      return <KebabVerticalIcon />;
    if(props.menuIcon === "gear")
      return <GearIcon />
    if(props.menuIcon === "arrow")
      return <TriangleDownIcon />
    if(props.menuIcon === "bars")
      return <ThreeBarsIcon />

    return props.menuIcon;
  }

  const MenuLabel = ()=> {
    if(!props.label)
      return null;
    return (<span className="mr-1">{props.label}</span>)
  }

  const dir = props.direction || "dropleft";
  const css = props.className || "";

  return (
    <div className={`MoreMenu dropdown ${dir} ${css}`}>
      <button type="button" className="MoreIcon btn btn-link m-0 p-0 bg-none" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
        <MenuLabel /><MenuIcon />
      </button>
      <div className="dropdown-menu mt-0 pt-0 dropdown-menu-right">
        {props.children}
      </div>
    </div>
  )

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

      // <path fill-rule="evenodd" d="M0 2.5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm0 5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0zm0 5a1.5 1.5 0 1 1 3 0 1.5 1.5 0 0 1-3 0z"></path>

export default MoreMenu;
export {KebabVerticalIcon}