import React from 'react';
import _ from "lodash";

const MoreText = (props)=> {
  const chars = props.chars || 200;
  const css = props.className || "";
  const a = props.text.substr(0,chars);
  const b = props.text.substr(chars-1);

  return (
    <span className={`MoreText ${css}`}>{a}<Dots text={b} /></span>
  )

}

const Dots = (props) => {
  if(props.text.length === 0)
    return null;

  const id = _.uniqueId("#dots_");
  return (
    <span id={id}>…</span>
  )
}

export default MoreText;