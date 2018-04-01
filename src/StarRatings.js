import React from "react";
import _ from "lodash";
import {StarIcon} from "react-octicons";

const StarGradient = (props)=> {
  return (

    <svg className="d-none">
      <linearGradient id="QuarterFull">
        <stop offset="25%" stopColor="#6c757d"/>
        <stop offset="75%" stopColor="white"/>
      </linearGradient>
      <linearGradient id="HalfFull">
        <stop offset="52%" stopColor="#6c757d"/>
        <stop offset="48%" stopColor="white"/>
      </linearGradient>
      <linearGradient id="ThreeQuartersFull">
        <stop offset="75%" stopColor="#6c757d"/>
        <stop offset="25%" stopColor="white"/>
      </linearGradient>
    </svg>
  )

}

const StarRatings = (props)=>{

  const stars = _.map([true,true,true,true,true], (n, i, t)=>{
    return (
      <Star key={`star_${props.responseId}_${i}`} 
        val={i+1} 
        rating={props.rating} />
    );
  });

  return (
    <div className="d-flex justify-content-between">{stars}</div>
  );

}

const Star = (props)=> {

  const fillStyle = (v, rating)=> {

    if(!rating)
      return "not-rated";

    if(props.val<=props.rating)
      return "filled";
    
    if(props.val > Math.ceil(rating))
      return "";

    const pct = (rating - Math.floor(rating)) * 100;
    if(pct < 12.5)
      return "";
    if(pct < 37)
      return "quarter";
    if(pct < 57)
      return "half";
    if(pct < 87)
      return "three-quarters";

    return "filled";
  }

  let fill = fillStyle(props.val, props.rating);

  return (
    <div className={`Star pr-1 pl-1 ${fill}`}><StarIcon /></div>
    );
}

export {StarGradient, StarRatings, Star}