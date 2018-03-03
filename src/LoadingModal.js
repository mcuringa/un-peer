import React from 'react';

const LoadingModal = (props)=> {
  
  const showSomeClass = (props.show)?"":"d-none";
  
  return (
    <div className={`LoadingModal ${showSomeClass}`} id="LoadingModal" 
      tabIndex="-1" role="dialog" 
      aria-labelledby="loadingModalMessagePane" aria-hidden="true">
        <div className="LoadingModalContent">
          <img className="LoadingSpinner" src="/img/puff.svg" alt="spinning icon" />
          <div className="LoadingStatusMsg">{props.status}</div>
        </div>
    </div>
  );
}


export default LoadingModal;
