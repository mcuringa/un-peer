import React from 'react';
import PropTypes from 'prop-types';

const LoadingModal = (props)=> {

  const showSomeClass = (props.show)?"":"d-none";

  return (
    <div className={`LoadingModal ${showSomeClass}`} id="LoadingModal"
      tabIndex="-1" role="dialog"
      aria-labelledby="loadingModalMessagePane" aria-hidden="true">
        <div className="LoadingModalContent">
          <div className="loader-inner ball-pulse">
              <div></div>
              <div></div>
              <div></div>
          </div>
          <div className="LoadingStatusMsg text-muted">{props.status}</div>
        </div>
    </div>
  );
}


export default LoadingModal;

LoadingModal.propTypes = {
  show: PropTypes.bool,
  status: PropTypes.string
};
