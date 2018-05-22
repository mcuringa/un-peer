import React from "react";
import _ from "lodash";
import {StarIcon} from "react-octicons";


const StarGradient = (props)=> {
  const angles = {
    x1:"0%",
    y1:"50%",
    x2:"100%",
    y2:"50%"
  }
  return (
    <div style={{height: 0, zIndex: -999, position: "absolute", left: -1600}}>
    <svg>
      <pattern id="UnratedHash" patternUnits="userSpaceOnUse" width="4" height="4">
        <path d="M-1,1 l2,-2
                 M0,4 l4,-4
                 M3,5 l2,-2" 
              style={{stroke:"black", strokeWidth:1}} />
      </pattern>
      <linearGradient id="QuarterFull" {...angles}>
        <stop offset="40%" stopColor="#6c757d"/>
        <stop offset="40%" stopColor="white"/>
      </linearGradient>
      <linearGradient id="HalfFull" {...angles}>
        <stop offset="50%" stopColor="#6c757d"/>
        <stop offset="50%" stopColor="white"/>
      </linearGradient>
      <linearGradient id="ThreeQuartersFull" {...angles}>
        <stop offset="60%" stopColor="#6c757d"/>
        <stop offset="60%" stopColor="white"/>
      </linearGradient>

    </svg>
    </div>
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
    <div className="d-flex justify-content-between">
      {stars}
    </div>
  );

}

const Star = (props)=> {

  const fillStyle = (v, rating)=> {

    if(!rating || rating <= 0)
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