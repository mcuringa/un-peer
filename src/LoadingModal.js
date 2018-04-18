import React from 'react';
import PropTypes from 'prop-types';

const LoadingModal = (props)=> {

  const showSomeClass = (props.show)?"":"d-none";

  return (
    <div className={`LoadingModal ${showSomeClass}`} id="LoadingModal"
      tabIndex="-1" role="dialog"
      aria-labelledby="loadingModalMessagePane" aria-hidden="true">
      <div className="LoadingModalContent">
        <Spinner show={true} />
        <div className="LoadingStatusMsg text-muted">{props.status}</div>
      </div>
    </div>
  );
}


const Spinner = (props)=> {
  if(!props.show)
    return null;

  return (
    <div className={`loader-inner ball-pulse ${props.className}`}>
      <div></div><div></div><div></div>
    </div>
  )
}


export default LoadingModal;
export {Spinner};

LoadingModal.propTypes = {
  show: PropTypes.bool,
  status: PropTypes.string
};
